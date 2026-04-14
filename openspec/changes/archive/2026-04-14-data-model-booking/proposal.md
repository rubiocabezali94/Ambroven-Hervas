## Why

El sistema ya dispone de tours con slots de disponibilidad. Sin una entidad de reserva, no existe forma de registrar quién ha comprado qué slot, ni de integrar el pago con Stripe ni de sincronizar el evento con Google Calendar. Este change cierra la brecha entre "slot disponible" y "plaza ocupada pagada".

## What Changes

- Nueva entidad **`Booking`**: registra la reserva de un turista para un slot concreto, con pago completo vía Stripe, importes congelados, política de cancelación y referencia al evento de Google Calendar
- Nuevo `BookingStatus` enum en `enums.ts` (backend y frontend): `pending_payment`, `confirmed`, `completed`, `cancelled`, `refunded`
- Relaciones nuevas: `User → Booking`, `Tour → Booking`, `TourSlot → Booking`

## Capabilities

### New Capabilities

- `booking-lifecycle`: ciclo de vida de una reserva desde `pending_payment` hasta `confirmed`, `cancelled`, `refunded` o `completed`
- `booking-atomicity`: creación de reserva y decremento de `available_spots` en una única transacción con `SELECT FOR UPDATE`
- `booking-payment`: pago completo al reservar vía Stripe Elements con un único PaymentIntent
- `cancellation-policy`: reembolso del 100% si se cancela con más de 7 días de antelación; reembolso del 75% (retención del 25%) si se cancela con 7 días o menos

### Modified Capabilities

_(ninguna — no hay cambios en specs existentes)_

## Impact

- Nueva tabla `bookings` con FK → `users`, `tours`, `tour_slots`
- Nuevo enum `BookingStatus` en `backend/src/entities/enums.ts` y `frontend/src/app/core/models/enums.ts`
- Campos en `bookings`: `num_persons`, `total_amount`, `cancellation_deadline`, `stripe_payment_intent_id`, `stripe_payment_status`, `cancelled_at`, `google_calendar_event_id`
- `TourSlot.available_spots` se decrementa al confirmar una reserva (Change 19 implementa el `SELECT FOR UPDATE`; este change define el esquema que lo soporta)
- Base para Changes 5 (Review), 11 (UI booking), 14 (admin bookings), 19 (booking flow backend), 22 (email confirmación), 23 (payment timeout)
