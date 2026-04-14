# Design: data-model-tour-slot

## Decisiones de arquitectura

### 1. TIMESTAMP WITH TIME ZONE para start_datetime / end_datetime

Los tours pueden tener guías en diferentes zonas horarias y turistas internacionales. Se almacena siempre en UTC (`TIMESTAMPTZ`) para evitar ambigüedades. La conversión a zona local del usuario es responsabilidad del frontend.

TypeORM mapea `TIMESTAMPTZ` usando `{ type: 'timestamptz' }` en el decorador `@Column`.

### 2. CHECK constraint `available_spots >= 0` en BD

Se añade como constraint SQL nativo en la migración:

```sql
ALTER TABLE tour_slots ADD CONSTRAINT chk_available_spots_non_negative
  CHECK (available_spots >= 0);
```

Esto es la última línea de defensa contra race conditions que escapen al `SELECT FOR UPDATE` del backend. TypeORM no genera este constraint automáticamente — se añade manualmente en la migración.

### 3. No FK con CHECK a `tour.max_capacity`

El constraint `available_spots <= tour.max_capacity` **no** se implementa como FK ni CHECK en BD porque requeriría un JOIN en la evaluación del constraint (no soportado en PostgreSQL sin triggers). La validación vive en el servicio de backend (Change 19).

### 4. Campo `blocked` + `blocked_reason`

Permite al admin bloquear un slot puntualmente (mantenimiento, evento privado, etc.) sin tener que eliminarlo. Un slot con `blocked = true` se trata igual que `available_spots = 0` a efectos de reservas. El `blocked_reason` es informativo, nunca expuesto al turista.

### 5. Índice compuesto `(tour_id, start_datetime)`

La consulta más frecuente es "dame todos los slots disponibles de este tour ordenados por fecha":

```sql
SELECT * FROM tour_slots
WHERE tour_id = $1 AND start_datetime >= NOW()
ORDER BY start_datetime ASC;
```

El índice compuesto cubre ambos predicados y el ORDER BY sin filesort.

### 6. ON DELETE CASCADE desde Tour

Si un tour se elimina (solo posible en estado `draft`), sus slots se eliminan en cascada. Si el tour está `published` o `archived`, el backend impide la eliminación antes de llegar a la BD — la cascade es un seguro adicional.

## Estructura de archivos generados

```
backend/src/
  entities/
    TourSlot.ts          → entidad TypeORM
  migrations/
    <timestamp>-CreateTourSlotTable.ts
  dtos/
    create-tour-slot.dto.ts
    update-tour-slot.dto.ts

frontend/src/app/core/models/
  tour-slot.model.ts     → interfaz TourSlot
```
