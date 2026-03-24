# Design: data-model-tour

## Decisiones de arquitectura

### 1. Waypoints en tabla separada (no array JSON)

`Waypoint` es una entidad propia con FK `tour_id` en lugar de almacenarse como `jsonb[]` en `tours`. Motivos:
- Reordenación eficiente: `UPDATE waypoints SET order = $1 WHERE id = $2` sin reescribir el array completo
- Consultas geoespaciales futuras (bounding box, proximidad) directas contra la tabla
- Integridad referencial implícita: `ON DELETE CASCADE` limpia waypoints al borrar un tour

### 2. Columna `search_vector` con índice GIN

Se añade una columna `TSVECTOR` generada automáticamente en PostgreSQL (modo `STORED`) combinando `title` (weight A) y `description` (weight B). El índice GIN permite búsqueda full-text nativa sin extensiones externas:

```sql
ALTER TABLE tours ADD COLUMN search_vector TSVECTOR
  GENERATED ALWAYS AS (
    setweight(to_tsvector('spanish', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('spanish', coalesce(description, '')), 'B')
  ) STORED;

CREATE INDEX idx_tours_search_vector ON tours USING GIN(search_vector);
```

TypeORM no soporta columnas generadas para `TSVECTOR` de forma nativa: se gestionará via migración SQL raw.

### 3. Arrays nativos de PostgreSQL para `images` y `language`

Se usan `varchar[]` de PostgreSQL en lugar de tablas de unión porque:
- Las imágenes son URLs inmutables (S3/Firebase Storage), no entidades
- Los idiomas son un conjunto pequeño y cerrado (es, en, fr, pt)
- TypeORM soporta `'simple-array'` como type; en producción se usa el type `varchar[]` nativo via migración SQL

### 4. Estado inicial `draft`

Todo tour creado arranca en `draft`. La transición a `published` requiere validación: mínimo 1 imagen y todos los campos NOT NULL presentes. Esta lógica vive en el Change 18 (`backend-catalog`), no aquí. El modelo solo define el ENUM.

### 5. Índice compuesto en `(status, category)`

```sql
CREATE INDEX idx_tours_status_category ON tours(status, category);
```

La consulta más frecuente del catálogo filtra por `status = 'published'` y opcionalmente por `category`. El índice compuesto cubre ambos predicados.

### 6. Relación `operator_id` → `User`

Un tour pertenece a un usuario con rol `admin` (operador de la plataforma). La FK no impone restricción de rol a nivel de BD — eso lo valida el backend en tiempo de ejecución. Esto evita triggers complejos y mantiene la BD agnóstica al negocio.

## Estructura de archivos generados

```
backend/src/
  entities/
    Tour.ts           → entidad TypeORM
    Waypoint.ts       → entidad TypeORM
    enums.ts          → TourCategory + TourStatus (añadir al existente)
  migrations/
    <timestamp>-CreateTourTable.ts
  dtos/
    create-tour.dto.ts
    update-tour.dto.ts

frontend/src/app/core/models/
  tour.model.ts       → interfaz Tour + Waypoint
  enums.ts            → TourCategory + TourStatus (añadir al existente)
```
