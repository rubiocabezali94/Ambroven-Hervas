# Spec: slot-blocking

## Objetivo

Permitir al administrador bloquear un slot temporalmente, impidiendo nuevas reservas sin eliminarlo.

## Comportamiento esperado

### Escenario 1 — Slot bloqueado, turista intenta reservar

**GIVEN** un slot con `blocked = true`  
**WHEN** un turista intenta crear una reserva para ese slot  
**THEN** `HTTP 409 Conflict` `{ "error": "Slot not available" }`

La razón del bloqueo (`blocked_reason`) **no se expone** al turista.

### Escenario 2 — Admin bloquea un slot

**GIVEN** un slot con `blocked = false`  
**WHEN** un administrador envía `PATCH /api/v1/tour-slots/:id` con `{ "blocked": true, "blocked_reason": "Mantenimiento" }`  
**THEN**
- `HTTP 200 OK` con el slot actualizado
- `blocked = true`, `blocked_reason = "Mantenimiento"`

### Escenario 3 — Admin desbloquea un slot

**GIVEN** un slot con `blocked = true`  
**WHEN** un administrador envía `PATCH /api/v1/tour-slots/:id` con `{ "blocked": false }`  
**THEN**
- `HTTP 200 OK`
- `blocked = false`, `blocked_reason = null`

## Reglas adicionales

- `blocked_reason` es obligatorio si `blocked = true` (validación en DTO)
- `blocked_reason` máximo 200 caracteres
- Solo el rol `admin` puede modificar `blocked` y `blocked_reason` (Change 14)

## No-goals

- La UI del administrador para gestión de slots (Change 14)
- Notificaciones a turistas con reservas activas cuando se bloquea un slot (Change 22)
