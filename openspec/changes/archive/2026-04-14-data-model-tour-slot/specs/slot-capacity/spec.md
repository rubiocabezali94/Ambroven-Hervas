# Spec: slot-capacity

## Objetivo

Garantizar que un slot no puede ofrecer más plazas de las que el tour tiene como capacidad máxima.

## Comportamiento esperado

### Escenario 1 — Selector de participantes en frontend

**GIVEN** un slot con `available_spots = 3`  
**WHEN** el turista ve el selector de número de participantes  
**THEN** el máximo seleccionable es `3` (no el `max_capacity` del tour)

El frontend usa `available_spots` del slot, no `tour.max_capacity`, para limitar el selector.

### Escenario 2 — Crear slot con capacidad superior al tour

**GIVEN** un tour con `max_capacity = 10`  
**WHEN** un administrador intenta crear un slot con `available_spots = 15`  
**THEN** `HTTP 422 Unprocessable Entity` `{ "error": "available_spots cannot exceed tour max_capacity" }`

Esta validación ocurre en el servicio de backend (Change 14), no en la entidad ni en la BD.

### Escenario 3 — Valor válido

**GIVEN** un tour con `max_capacity = 20`  
**WHEN** se crea un slot con `available_spots = 8`  
**THEN** `HTTP 201 Created` con el slot creado

## Reglas adicionales

- `available_spots >= 0` siempre (constraint SQL + validación DTO)
- `available_spots` puede ser 0 al crear (slot "agotado de antemano", útil para gestión manual)

## No-goals

- La lógica de recalcular `available_spots` tras una cancelación (Change 19)
- El selector visual de participantes (Change 11)
