## Context

La plataforma ya tiene `Tour`, `TourSlot` y `User`. Falta la pieza que conecta un usuario con un slot concreto y registra el pago. La entidad `Booking` es el núcleo transaccional del sistema: sin ella no hay reservas reales, integración con Stripe ni eventos de Google Calendar.

## Goals / Non-Goals

**Goals:**
- Definir el esquema de la tabla `bookings` con todos los campos necesarios para las integraciones de Stripe y Google Calendar
- Establecer el `BookingStatus` enum como contrato entre frontend, backend y base de datos
- Preparar la entidad para que Change 19 pueda implementar el `SELECT FOR UPDATE` sin cambios de esquema
- Proveer DTOs de validación para creación y actualización de reservas

**Non-Goals:**
- La lógica de `SELECT FOR UPDATE` y decremento de `available_spots` (Change 19)
- El endpoint `POST /api/v1/bookings` (Change 19)
- La UI del flujo de reserva (Change 11)
- La gestión de reservas por el admin (Change 14)
- El envío de emails de confirmación (Change 22)
- La cancelación automática por timeout de pago (Change 23)
- El webhook de Stripe (Change 21)

## Decisions

### 1. `tour_id` desnormalizado en Booking

`Booking` incluye `tour_id` aunque podría obtenerse via `slot.tour_id`. Razones:
- Las queries más frecuentes ("mis reservas", "reservas de este tour") necesitan `tour_id` directamente
- Evita un JOIN innecesario en rutas críticas
- Riesgo de inconsistencia es mínimo: `tour_id` no cambia en un slot existente

### 2. `stripe_payment_intent_id` y `stripe_payment_status` como VARCHAR, no relación

Almacenar el estado de Stripe en la propia tabla `bookings` es suficiente. El estado de Stripe es informativo — la fuente de verdad es Stripe, y el webhook (Change 21) actualizará estos campos. Un campo `VARCHAR(50)` es suficiente para los valores actuales de Stripe (`requires_payment_method`, `processing`, `succeeded`, `canceled`).

### 3. `google_calendar_event_id` como VARCHAR(200)

Los IDs de eventos de Google Calendar son strings opacos. Se almacena para poder actualizar o eliminar el evento si la reserva se cancela (Change 22). No requiere tabla propia.

### 4. `cancelled_at` como TIMESTAMPTZ nullable en lugar de derivarlo de `updated_at`

Permite consultas eficientes como "reservas canceladas en los últimos 7 días" sin depender del estado. También es más explícito para auditoría.

### 5. `BookingStatus` como enum PostgreSQL nativo

Consistente con `TourStatus` y `UserRole`. El enum nativo garantiza integridad en BD y TypeORM lo mapea automáticamente.

Los valores en orden de ciclo de vida:
- `pending_payment` → PaymentIntent creado, esperando confirmación de Stripe
- `confirmed` → pago completado (`payment_intent.succeeded`)
- `completed` → tour realizado (transición manual o automática post-fecha)
- `cancelled` → cancelado (por turista, admin o timeout)
- `refunded` → reembolso total o parcial procesado via Stripe

### 6. `num_persons` y `total_amount` congelados en el momento de la reserva

`total_amount` se calcula y graba al crear la booking (`num_persons × tour.price_per_person`). Esto evita que un cambio posterior del precio del tour afecte a reservas ya existentes.

### 7. Política de cancelación: campo `cancellation_deadline`

Se almacena `cancellation_deadline TIMESTAMPTZ` calculado como `slot.start_datetime - 7 days` en el momento de crear la booking. Permite evaluaciones eficientes sin recalcular en cada request.

La política de reembolso que aplica Change 21 (webhook Stripe) al cancelar:
- `cancelled_at <= cancellation_deadline` → reembolso del 100% del `total_amount`
- `cancelled_at > cancellation_deadline` → reembolso del 75%; se retiene el 25% como penalización

### 8. Índices

- `idx_bookings_user_id` en `user_id` → para "mis reservas"
- `idx_bookings_slot_id` en `slot_id` → para consultar ocupación de un slot
- `idx_bookings_status` en `status` → para filtrar por estado en el panel admin

## Risks / Trade-offs

- **[Riesgo] `tour_id` desnormalizado puede quedar desincronizado si se modifica el `slot.tour_id`** → Mitigation: los slots son inmutables una vez creados (no tiene sentido cambiar a qué tour pertenece un slot)
- **[Riesgo] Race condition al crear reservas concurrentes** → Mitigation: definido el contrato en `slot-concurrency` spec; Change 19 implementa `SELECT FOR UPDATE`
- **[Trade-off] `stripe_payment_status` duplica estado de Stripe** → Aceptado: permite mostrar estado sin llamar a la API de Stripe en cada request
- **[Trade-off] Reembolso parcial requiere lógica en el webhook** → Aceptado: Change 21 evalúa `cancellation_deadline` para decidir el importe a reembolsar; la entidad ya expone el campo precalculado
