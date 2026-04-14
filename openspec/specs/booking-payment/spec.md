# Spec: booking-payment

## Objetivo

Definir el modelo de pago: cobro completo en el momento de la reserva vía Stripe Elements, con un único PaymentIntent por reserva.

## Comportamiento esperado

### Escenario 1 — Pago exitoso

**GIVEN** un turista ha seleccionado slot y número de personas  
**WHEN** introduce los datos de tarjeta y confirma  
**THEN**
- Se crea un `PaymentIntent` de Stripe por `total_amount = num_persons × tour.price_per_person`
- El importe queda congelado en `bookings.total_amount` en el momento de la reserva
- `stripe_payment_intent_id` se almacena en la reserva
- Tras confirmación de Stripe: `status = confirmed`, `stripe_payment_status = 'succeeded'`

### Escenario 2 — Pago fallido

**GIVEN** un PaymentIntent creado  
**WHEN** Stripe devuelve estado `requires_payment_method` o `canceled`  
**THEN**
- `stripe_payment_status` se actualiza al valor devuelto por Stripe
- La reserva permanece en `pending_payment`
- El turista puede reintentar con otra tarjeta (mismo PaymentIntent)

### Escenario 3 — `total_amount` congelado

**GIVEN** una reserva `confirmed` con `total_amount = 120.00`  
**WHEN** el operador modifica `tour.price_per_person`  
**THEN** `bookings.total_amount` sigue siendo `120.00`

El importe se calcula y congela al crear la reserva, nunca se recalcula a posteriori.

### Escenario 4 — `num_persons` inválido

**GIVEN** un request con `num_persons <= 0` o `num_persons > slot.available_spots`  
**WHEN** se intenta crear la booking  
**THEN** `HTTP 400 Bad Request` `{ "error": "Invalid num_persons" }`

## Reglas

- Un solo `PaymentIntent` por reserva (campo `stripe_payment_intent_id` único a nivel lógico)
- No se soporta pago aplazado ni parcial
- `total_amount` = `num_persons × tour.price_per_person` calculado en el backend, nunca aceptado del cliente
- `available_spots` **no se decrementa** hasta que `status = confirmed` (tras `payment_intent.succeeded`)

## Contrato para implementaciones futuras

- Change 19 (`booking-flow-backend`) crea el `PaymentIntent` y devuelve el `client_secret` al frontend
- El decremento de `available_spots` ocurre solo tras `payment_intent.succeeded` (Change 21)

## No-goals

- La integración real con Stripe Elements (Change 21)
- El webhook `payment_intent.succeeded` (Change 21)
- Apple Pay / Google Pay (Change 21)
- La cancelación automática por timeout de pago (Change 23)
