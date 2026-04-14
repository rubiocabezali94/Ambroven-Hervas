## 1. Enum y entidad TypeORM

- [x] 1.1 Añadir `BookingStatus` al archivo `backend/src/entities/enums.ts` con los valores: `PENDING_PAYMENT = 'pending_payment'`, `CONFIRMED = 'confirmed'`, `COMPLETED = 'completed'`, `CANCELLED = 'cancelled'`, `REFUNDED = 'refunded'`
- [x] 1.2 Crear `backend/src/entities/Booking.ts` con: UUID PK, user ManyToOne→User (RESTRICT, JoinColumn user_id), tour ManyToOne→Tour (RESTRICT, JoinColumn tour_id), slot ManyToOne→TourSlot (RESTRICT, JoinColumn slot_id), status (enum BookingStatus, default PENDING_PAYMENT), num_persons (INT NOT NULL), total_amount (DECIMAL 10,2 NOT NULL), cancellation_deadline (timestamptz NOT NULL), stripe_payment_intent_id (VARCHAR 200 nullable), stripe_payment_status (VARCHAR 50 nullable), google_calendar_event_id (VARCHAR 200 nullable), cancelled_at (timestamptz nullable), created_at, updated_at
- [x] 1.3 Añadir relación inversa `@OneToMany(() => Booking, b => b.user) bookings: Booking[]` en `User.ts`
- [x] 1.4 Añadir relación inversa `@OneToMany(() => Booking, b => b.tour) bookings: Booking[]` en `Tour.ts`
- [x] 1.5 Añadir relación inversa `@OneToMany(() => Booking, b => b.slot) bookings: Booking[]` en `TourSlot.ts`
- [x] 1.6 Registrar `Booking` en el array `entities` de `backend/src/data-source.ts`

**Verificación**: `tsc --noEmit` sin errores.

## 2. Migración

- [x] 2.1 Escribir manualmente `backend/src/migrations/<timestamp>-CreateBookingTable.ts` con: `CREATE TABLE bookings` con todos los campos, FK → `users(id)` RESTRICT, FK → `tours(id)` RESTRICT, FK → `tour_slots(id)` RESTRICT, enum `bookings_status_enum`
- [x] 2.2 Añadir en el método `up()` los índices:
  ```sql
  CREATE INDEX "idx_bookings_user_id" ON "bookings" ("user_id");
  CREATE INDEX "idx_bookings_slot_id" ON "bookings" ("slot_id");
  CREATE INDEX "idx_bookings_status" ON "bookings" ("status");
  ```
- [x] 2.3 Añadir en el método `down()` los DROP correspondientes
- [x] 2.4 Ejecutar la migración: `npm run migration:run`

**Verificación**: La tabla `bookings` existe en pgAdmin con todos los campos, FK e índices.

## 3. DTOs de validación

- [x] 3.1 Crear `backend/src/dtos/create-booking.dto.ts` con class-validator: `slot_id` (@IsUUID), `num_persons` (@IsInt @Min(1))  _(`tour_id`, `total_amount` y `cancellation_deadline` los calcula el backend — no se aceptan del cliente)_
- [x] 3.2 Crear `backend/src/dtos/update-booking.dto.ts` con campos opcionales: `status` (@IsEnum(BookingStatus) @IsOptional), `stripe_payment_intent_id` (@IsString @MaxLength(200) @IsOptional), `stripe_payment_status` (@IsString @MaxLength(50) @IsOptional), `google_calendar_event_id` (@IsString @MaxLength(200) @IsOptional), `cancelled_at` (@IsDateString @IsOptional)

## 4. Modelos frontend

- [x] 4.1 Añadir `BookingStatus` al archivo `frontend/src/app/core/models/enums.ts` con los mismos valores que el backend
- [x] 4.2 Crear `frontend/src/app/core/models/booking.model.ts` con la interfaz `Booking`: id, user_id, tour_id, slot_id, status (BookingStatus), num_persons (number), total_amount (number), cancellation_deadline (string), stripe_payment_intent_id (string|null), stripe_payment_status (string|null), google_calendar_event_id (string|null), cancelled_at (string|null), created_at, updated_at
