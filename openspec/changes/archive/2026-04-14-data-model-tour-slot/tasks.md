## 1. Entidad TypeORM

- [x] 1.1 Crear `backend/src/entities/TourSlot.ts` con: UUID PK, tour ManyToOne→Tour (ON DELETE CASCADE, JoinColumn tour_id), start_datetime (timestamptz NOT NULL), end_datetime (timestamptz NOT NULL), available_spots (INT NOT NULL), blocked (BOOLEAN NOT NULL default false), blocked_reason (VARCHAR 200 nullable), created_at, updated_at
- [x] 1.2 Añadir relación inversa `@OneToMany(() => TourSlot, s => s.tour) slots: TourSlot[]` en `backend/src/entities/Tour.ts`
- [x] 1.3 Registrar `TourSlot` en el array `entities` de `backend/src/data-source.ts`

**Verificación**: `tsc --noEmit` no produce errores.

## 2. Migración

- [x] 2.1 Generar la migración: `npm run migration:generate -- src/migrations/CreateTourSlotTable`
- [x] 2.2 Revisar el SQL generado: debe incluir `CREATE TABLE tour_slots` con todos los campos, FK `tour_id → tours(id)` ON DELETE CASCADE
- [x] 2.3 Añadir manualmente al final del método `up()` el CHECK constraint y el índice:
  ```sql
  ALTER TABLE "tour_slots" ADD CONSTRAINT "chk_available_spots_non_negative"
    CHECK (available_spots >= 0);
  CREATE INDEX "idx_tour_slots_tour_datetime"
    ON "tour_slots" ("tour_id", "start_datetime");
  ```
- [x] 2.4 Añadir en el método `down()` el DROP correspondiente:
  ```sql
  DROP INDEX IF EXISTS "idx_tour_slots_tour_datetime";
  ALTER TABLE "tour_slots" DROP CONSTRAINT IF EXISTS "chk_available_spots_non_negative";
  ```
- [x] 2.5 Ejecutar la migración: `npm run migration:run`

**Verificación**: La tabla `tour_slots` existe con todos los campos, FK y el índice compuesto.

## 3. DTOs de validación

- [x] 3.1 Crear `backend/src/dtos/create-tour-slot.dto.ts` con class-validator: `tour_id` (@IsUUID), `start_datetime` (@IsDateString), `end_datetime` (@IsDateString), `available_spots` (@IsInt @Min(0)), `blocked` (@IsBoolean @IsOptional), `blocked_reason` (@IsString @MaxLength(200) @IsOptional)
- [x] 3.2 Crear `backend/src/dtos/update-tour-slot.dto.ts` con todos los campos opcionales (sin tour_id ni start_datetime): `end_datetime`, `available_spots`, `blocked`, `blocked_reason`

## 4. Modelo frontend

- [x] 4.1 Crear `frontend/src/app/core/models/tour-slot.model.ts` con la interfaz `TourSlot`: id, tour_id, start_datetime, end_datetime, available_spots, blocked, blocked_reason (string|null), created_at, updated_at (todos string salvo available_spots number y blocked boolean)
