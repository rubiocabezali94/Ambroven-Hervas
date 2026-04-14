# Spec: cancellation-policy

## Objetivo

Definir la política de reembolso en función del plazo de cancelación respecto al inicio del tour.

## Política

| Momento de cancelación | Reembolso |
|---|---|
| `cancelled_at <= cancellation_deadline` | **100%** de `total_amount` |
| `cancelled_at > cancellation_deadline` | **75%** de `total_amount` (retención del 25%) |

Donde `cancellation_deadline = slot.start_datetime − 7 días`, precalculado y almacenado en `bookings.cancellation_deadline` al crear la reserva.

## Escenarios

### Escenario 1 — Cancelación dentro del plazo (reembolso total)

**GIVEN** una reserva con `status = confirmed`  
**AND** `cancelled_at <= cancellation_deadline`  
**WHEN** el turista o admin cancela la reserva  
**THEN**
- Se inicia un reembolso del **100%** de `total_amount` vía Stripe
- `status = cancelled`, `cancelled_at = NOW()`
- Tras `charge.refunded` del webhook: `status = refunded`
- El turista recibe email de cancelación con confirmación de reembolso total (Change 22)

### Escenario 2 — Cancelación fuera del plazo (reembolso parcial)

**GIVEN** una reserva con `status = confirmed`  
**AND** `cancelled_at > cancellation_deadline`  
**WHEN** el turista o admin cancela la reserva  
**THEN**
- Se inicia un reembolso del **75%** de `total_amount` vía Stripe (el 25% se retiene)
- `status = cancelled`, `cancelled_at = NOW()`
- Tras `charge.refunded` del webhook: `status = refunded`
- El turista recibe email indicando la penalización aplicada (Change 22)

### Escenario 3 — `cancellation_deadline` precalculado

**GIVEN** un slot con `start_datetime = 2026-05-20T10:00:00Z`  
**WHEN** se crea una reserva para ese slot  
**THEN** `cancellation_deadline = 2026-05-13T10:00:00Z` (exactamente 7 días antes)

El campo se calcula en el backend al crear la reserva y nunca se acepta del cliente.

### Escenario 4 — Cancelación de reserva `pending_payment`

**GIVEN** una reserva con `status = pending_payment`  
**WHEN** se cancela (por timeout o manualmente)  
**THEN**
- Se cancela el `PaymentIntent` en Stripe si existe (sin cargo al cliente)
- `status = cancelled`, `cancelled_at = NOW()`
- No se emite reembolso

### Escenario 5 — Intento de cancelar una reserva `completed`

**GIVEN** una reserva con `status = completed`  
**WHEN** cualquier actor intenta cancelarla  
**THEN** `HTTP 409 Conflict` `{ "error": "Cannot cancel a completed booking" }`

## Reglas

- Solo reservas con `status = confirmed` pueden transicionar a `refunded`
- El cálculo del importe a reembolsar se realiza en el backend (Change 19), nunca en el cliente
- `cancellation_deadline` es de solo lectura tras la creación de la reserva

## Contrato para implementaciones futuras

- Change 19 expone `DELETE /api/v1/bookings/:id` — actualiza `status` y `cancelled_at`, delega el reembolso a Change 21
- Change 21 ejecuta el reembolso en Stripe consultando `cancellation_deadline` para determinar el importe

## No-goals

- La ejecución del reembolso en Stripe (Change 21)
- La UI de cancelación (Change 11/12)
- Las notificaciones al turista tras cancelar (Change 22)
