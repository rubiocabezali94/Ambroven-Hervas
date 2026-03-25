## 1. Entidades TypeORM

- [x] 1.1 Crear `backend/src/entities/Tour.ts` con todos los campos del plan: UUID PK, title, description, short_description, category ENUM, price_per_person, duration_hours, max_capacity, language (simple-array), images (simple-array), status ENUM, meeting_point, meeting_point_lat, meeting_point_lng, operator_id FK → User, created_at, updated_at
- [x] 1.2 Crear `backend/src/entities/Waypoint.ts` con: UUID PK, tour_id FK → Tour (ON DELETE CASCADE), lat, lng, order, label
- [x] 1.3 Añadir `TourCategory` y `TourStatus` al archivo `backend/src/entities/enums.ts` (no reemplazar, añadir)
- [x] 1.4 Establecer la relación `@OneToMany(() => Waypoint, w => w.tour)` en `Tour.ts` y `@ManyToOne(() => Tour, t => t.waypoints)` en `Waypoint.ts`
- [x] 1.5 Registrar `Tour` y `Waypoint` en `backend/src/data-source.ts`

**Verificación**: `tsc --noEmit` no produce errores en los archivos nuevos.

## 2. Migración

- [x] 2.1 Generar la migración: `npm run migration:generate -- src/migrations/CreateTourTable`
- [x] 2.2 Revisar el SQL generado: debe incluir `CREATE TYPE tour_category_enum`, `CREATE TYPE tour_status_enum`, `CREATE TABLE tours` con FK a `users`, `CREATE TABLE waypoints` con FK a `tours` ON DELETE CASCADE
- [x] 2.3 Añadir manualmente al final del método `up()` de la migración el bloque SQL para la columna generada y su índice GIN:
  ```sql
  ALTER TABLE tours ADD COLUMN search_vector tsvector
    GENERATED ALWAYS AS (
      setweight(to_tsvector('spanish', coalesce(title, '')), 'A') ||
      setweight(to_tsvector('spanish', coalesce(description, '')), 'B')
    ) STORED;
  CREATE INDEX idx_tours_search_vector ON tours USING GIN(search_vector);
  CREATE INDEX idx_tours_status_category ON tours(status, category);
  ```
- [x] 2.4 Añadir en el método `down()` el DROP correspondiente:
  ```sql
  DROP INDEX IF EXISTS idx_tours_search_vector;
  DROP INDEX IF EXISTS idx_tours_status_category;
  ALTER TABLE tours DROP COLUMN IF EXISTS search_vector;
  ```
- [x] 2.5 Ejecutar la migración: `npm run migration:run`

**Verificación**: Las tablas `tours` y `waypoints` aparecen en pgAdmin (`http://localhost:5050`) con todos los campos, índices y FK correctos. La columna `search_vector` está presente.

## 3. DTOs de validación

- [x] 3.1 Crear `backend/src/dtos/create-tour.dto.ts` con `class-validator`:
  - `title`: `@IsString()`, `@Length(1, 200)`
  - `description`: `@IsString()`, `@MinLength(50)`
  - `short_description`: `@IsString()`, `@Length(1, 300)`
  - `category`: `@IsEnum(TourCategory)`
  - `price_per_person`: `@IsNumber()`, `@Min(0)`
  - `duration_hours`: `@IsNumber()`, `@Min(0.5)`
  - `max_capacity`: `@IsInt()`, `@Min(1)`
  - `language`: `@IsArray()`, `@IsString({ each: true })`, `@ArrayMinSize(1)`
  - `images`: `@IsArray()`, `@IsUrl({}, { each: true })`
  - `status`: `@IsEnum(TourStatus)`, `@IsOptional()` (default `draft` en el servicio)
  - `meeting_point`: `@IsString()`, `@Length(1, 300)`
  - `meeting_point_lat`: `@IsNumber()`, `@Min(-90)`, `@Max(90)`
  - `meeting_point_lng`: `@IsNumber()`, `@Min(-180)`, `@Max(180)`
- [x] 3.2 Crear `backend/src/dtos/update-tour.dto.ts` extendiendo con `PartialType(CreateTourDto)` (todos los campos opcionales)
- [x] 3.3 Crear `backend/src/dtos/create-waypoint.dto.ts`:
  - `lat`: `@IsNumber()`, `@Min(-90)`, `@Max(90)`
  - `lng`: `@IsNumber()`, `@Min(-180)`, `@Max(180)`
  - `order`: `@IsInt()`, `@Min(1)`
  - `label`: `@IsString()`, `@Length(1, 100)`

**Verificación**: Un DTO con `category: 'invalid'` falla la validación. Un DTO con `lat: 95` falla la validación.

## 4. Tipos TypeScript compartidos (frontend)

- [x] 4.1 Crear `frontend/src/app/core/models/tour.model.ts` con la interfaz `Tour` (todos los campos del plan excepto `search_vector`) y la interfaz `Waypoint`
- [x] 4.2 Añadir `TourCategory` y `TourStatus` al archivo `frontend/src/app/core/models/enums.ts` (no reemplazar UserRole, añadir)

**Verificación**: `ng build --no-optimization` compila sin errores de tipo en los modelos nuevos.
