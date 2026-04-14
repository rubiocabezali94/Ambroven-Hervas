# Proposal: data-model-tour-slot

**Change 3 de 26** | Depende de: `data-model-tour` (Change 2)

## Why

Un tour no tiene disponibilidad sin slots. La entidad `TourSlot` modela cada sesión concreta de un tour: una fecha/hora específica con un número limitado de plazas. Sin ella no puede existir el flujo de reserva (Change 4), el wizard de selección de fecha (Change 11) ni la gestión de disponibilidad en el panel admin (Change 14).

El reto principal de esta entidad es la **concurrencia**: dos usuarios pueden intentar reservar la última plaza al mismo tiempo. El modelo debe soportar la estrategia `SELECT FOR UPDATE` que el backend implementará en Change 19 para garantizar que `available_spots` nunca baje de 0.

## What Changes

### Entidad `TourSlot`

| Campo | Tipo | Restricciones |
|---|---|---|
| id | UUID | PK, auto-generado |
| tour_id | UUID | FK → Tour(id), ON DELETE CASCADE |
| start_datetime | TIMESTAMP WITH TIME ZONE | NOT NULL |
| end_datetime | TIMESTAMP WITH TIME ZONE | NOT NULL |
| available_spots | INT | NOT NULL, CHECK ≥ 0 |
| blocked | BOOLEAN | NOT NULL, default `false` |
| blocked_reason | VARCHAR(200) | nullable |
| created_at | TIMESTAMP | auto |
| updated_at | TIMESTAMP | auto |

**Constraint adicional:** `CHECK (available_spots <= tour.max_capacity)` se valida a nivel de aplicación en Change 19 (no en BD para evitar JOIN en constraint).

## Capabilities

- **slot-concurrency** — garantías de consistencia bajo carga concurrente
- **slot-blocking** — bloqueo manual de slots con motivo
- **slot-capacity** — validación de plazas disponibles y límite de capacidad

## Non-goals

- Decremento real de `available_spots` (ocurre en Change 19: `backend-bookings`)
- UI de selección de fecha/slot (Change 11: `ui-booking-flow`)
- CRUD de slots en el panel admin (Change 14: `ui-admin-panel`)
- Lógica de timeout de reservas pendientes (Change 23: `backend-notifications`)

## Impact

- Nueva tabla: `tour_slots`
- FK: `tour_slots.tour_id` → `tours.id` ON DELETE CASCADE
- Índice: `idx_tour_slots_tour_datetime` en `(tour_id, start_datetime)` — consulta principal del calendario
- Base para Changes 4, 11, 14, 19
