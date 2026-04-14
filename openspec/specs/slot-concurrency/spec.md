# Spec: slot-concurrency

## Objetivo

Garantizar que dos reservas simultáneas sobre el mismo slot no sobrepasen la capacidad disponible.

## Comportamiento esperado

### Escenario 1 — Dos requests concurrentes, available_spots = 1

**GIVEN** un slot con `available_spots = 1` y ninguna reserva activa  
**WHEN** dos requests llegan simultáneamente intentando reservar 1 plaza  
**THEN**
- Exactamente una petición recibe `HTTP 201 Created`
- La otra petición recibe `HTTP 409 Conflict` con body `{ "error": "No spots available" }`
- Tras ambas operaciones, `available_spots = 0`

### Escenario 2 — Request tras agotamiento

**GIVEN** un slot con `available_spots = 0`  
**WHEN** cualquier request intenta reservar  
**THEN** `HTTP 409 Conflict` `{ "error": "No spots available" }`

## Contrato para implementaciones futuras

El control de concurrencia **no se implementa en este Change**. Este spec define el contrato que Change 19 (`booking-flow-backend`) debe cumplir usando `SELECT FOR UPDATE`:

```sql
BEGIN;
SELECT available_spots FROM tour_slots WHERE id = $1 FOR UPDATE;
-- si available_spots >= participants_count → proceder
-- si no → ROLLBACK y devolver 409
UPDATE tour_slots SET available_spots = available_spots - $2 WHERE id = $1;
COMMIT;
```

La entidad `TourSlot` debe soportar esta lógica sin cambios de esquema.

## No-goals

- No se implementa aquí ninguna lógica de reserva (Change 19)
- No se implementa queue ni event sourcing
