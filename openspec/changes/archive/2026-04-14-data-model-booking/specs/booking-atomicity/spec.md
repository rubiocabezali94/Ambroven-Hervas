# Spec: booking-atomicity

## Objetivo

Garantizar que la creación de una reserva y el decremento de `available_spots` ocurren en una única transacción de base de datos, evitando sobreventa.

## Comportamiento esperado

### Escenario 1 — Creación exitosa

**GIVEN** un slot con `available_spots = 3` y `blocked = false`  
**AND** un turista solicita reservar `num_persons = 2`  
**WHEN** se procesa la solicitud de reserva  
**THEN**
- Se crea la reserva con `status = pending_payment`
- `available_spots` pasa a `1`
- Ambas operaciones ocurren en la misma transacción

### Escenario 2 — Sin plazas suficientes

**GIVEN** un slot con `available_spots = 1`  
**WHEN** un turista solicita reservar `num_persons = 2`  
**THEN** `HTTP 409 Conflict` `{ "error": "Not enough spots available" }`  
**AND** no se crea ninguna reserva  
**AND** `available_spots` no cambia

### Escenario 3 — Dos requests concurrentes

**GIVEN** un slot con `available_spots = 1`  
**WHEN** dos requests llegan simultáneamente para `num_persons = 1`  
**THEN** exactamente una recibe `HTTP 201 Created`  
**AND** la otra recibe `HTTP 409 Conflict`  
**AND** `available_spots = 0` tras ambas operaciones

## Contrato para Change 19

Este change define el esquema. Change 19 implementa la transacción con `SELECT FOR UPDATE`:

```sql
BEGIN;
SELECT available_spots FROM tour_slots WHERE id = $1 FOR UPDATE;
-- validar available_spots >= num_persons
INSERT INTO bookings (...) VALUES (...);
UPDATE tour_slots SET available_spots = available_spots - $2 WHERE id = $1;
COMMIT;
```

La entidad `Booking` y `TourSlot` soportan esta lógica sin cambios de esquema adicionales.

## No-goals

- La implementación del `SELECT FOR UPDATE` (Change 19)
- El endpoint `POST /api/v1/bookings` (Change 19)
