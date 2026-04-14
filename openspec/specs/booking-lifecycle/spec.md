# Spec: booking-lifecycle

## Objetivo

Definir los estados válidos de una reserva y las transiciones permitidas entre ellos.

## Estados

| Estado | Descripción |
|---|---|
| `pending_payment` | Reserva creada, esperando confirmación de pago de Stripe |
| `confirmed` | Pago recibido y confirmado |
| `completed` | Tour realizado (transición post-fecha del slot) |
| `cancelled` | Cancelada por el turista, el admin, o por timeout de pago |
| `refunded` | Reembolso procesado vía Stripe tras cancelación |

## Transiciones válidas

```
pending_payment → confirmed     (webhook Stripe: payment_intent.succeeded)
pending_payment → cancelled     (timeout 30 min sin pago — Change 23)
confirmed       → completed     (slot.start_datetime ha pasado)
confirmed       → refunded      (cancelación con reembolso)
confirmed       → cancelled     (cancelación sin reembolso — caso excepcional admin)
```

Ninguna transición inversa está permitida. Un estado `completed` o `refunded` es terminal.

## Escenarios

### Escenario 1 — Reserva confirmada

**GIVEN** una reserva con `status = pending_payment`  
**WHEN** Stripe envía el webhook `payment_intent.succeeded`  
**THEN**
- `status` transiciona a `confirmed`
- `stripe_payment_status = 'succeeded'`

### Escenario 2 — Reserva completada

**GIVEN** una reserva con `status = confirmed`  
**WHEN** la fecha `slot.start_datetime` ha pasado  
**THEN** `status` transiciona a `completed`

_(La transición automática es responsabilidad de Change 23; el esquema la soporta sin cambios)_

### Escenario 3 — Transición inválida

**GIVEN** una reserva con `status = completed`  
**WHEN** cualquier proceso intenta cambiar el status  
**THEN** la operación SHALL ser rechazada con `HTTP 422 Unprocessable Entity`

## No-goals

- La lógica de transición automática por timeout (Change 23)
- El endpoint que procesa el webhook de Stripe (Change 21)
