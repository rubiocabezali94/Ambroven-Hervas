import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBookingTable1776172046300 implements MigrationInterface {
  name = 'CreateBookingTable1776172046300';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "bookings_status_enum" AS ENUM (
        'pending_payment',
        'confirmed',
        'completed',
        'cancelled',
        'refunded'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "bookings" (
        "id"                          uuid                     NOT NULL DEFAULT uuid_generate_v4(),
        "user_id"                     uuid                     NOT NULL,
        "tour_id"                     uuid                     NOT NULL,
        "slot_id"                     uuid                     NOT NULL,
        "status"                      "bookings_status_enum"   NOT NULL DEFAULT 'pending_payment',
        "num_persons"                 integer                  NOT NULL,
        "total_amount"                numeric(10,2)            NOT NULL,
        "cancellation_deadline"       TIMESTAMP WITH TIME ZONE NOT NULL,
        "stripe_payment_intent_id"    character varying(200),
        "stripe_payment_status"       character varying(50),
        "google_calendar_event_id"    character varying(200),
        "cancelled_at"                TIMESTAMP WITH TIME ZONE,
        "created_at"                  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at"                  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_bookings" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "bookings"
        ADD CONSTRAINT "FK_bookings_user_id"
        FOREIGN KEY ("user_id")
        REFERENCES "users"("id")
        ON DELETE RESTRICT
    `);

    await queryRunner.query(`
      ALTER TABLE "bookings"
        ADD CONSTRAINT "FK_bookings_tour_id"
        FOREIGN KEY ("tour_id")
        REFERENCES "tours"("id")
        ON DELETE RESTRICT
    `);

    await queryRunner.query(`
      ALTER TABLE "bookings"
        ADD CONSTRAINT "FK_bookings_slot_id"
        FOREIGN KEY ("slot_id")
        REFERENCES "tour_slots"("id")
        ON DELETE RESTRICT
    `);

    await queryRunner.query(`CREATE INDEX "idx_bookings_user_id" ON "bookings" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "idx_bookings_slot_id" ON "bookings" ("slot_id")`);
    await queryRunner.query(`CREATE INDEX "idx_bookings_status" ON "bookings" ("status")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_bookings_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_bookings_slot_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_bookings_user_id"`);
    await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT IF EXISTS "FK_bookings_slot_id"`);
    await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT IF EXISTS "FK_bookings_tour_id"`);
    await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT IF EXISTS "FK_bookings_user_id"`);
    await queryRunner.query(`DROP TABLE "bookings"`);
    await queryRunner.query(`DROP TYPE "bookings_status_enum"`);
  }
}
