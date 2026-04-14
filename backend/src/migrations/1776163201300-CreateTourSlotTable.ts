import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTourSlotTable1776163201300 implements MigrationInterface {
  name = 'CreateTourSlotTable1776163201300';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "tour_slots" (
        "id"             uuid                     NOT NULL DEFAULT uuid_generate_v4(),
        "tour_id"        uuid                     NOT NULL,
        "start_datetime" TIMESTAMP WITH TIME ZONE  NOT NULL,
        "end_datetime"   TIMESTAMP WITH TIME ZONE  NOT NULL,
        "available_spots" integer                  NOT NULL,
        "blocked"        boolean                  NOT NULL DEFAULT false,
        "blocked_reason" character varying(200),
        "created_at"     TIMESTAMP WITH TIME ZONE  NOT NULL DEFAULT now(),
        "updated_at"     TIMESTAMP WITH TIME ZONE  NOT NULL DEFAULT now(),
        CONSTRAINT "PK_tour_slots" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "tour_slots"
        ADD CONSTRAINT "FK_tour_slots_tour_id"
        FOREIGN KEY ("tour_id")
        REFERENCES "tours"("id")
        ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "tour_slots"
        ADD CONSTRAINT "chk_available_spots_non_negative"
        CHECK (available_spots >= 0)
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_tour_slots_tour_datetime"
        ON "tour_slots" ("tour_id", "start_datetime")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_tour_slots_tour_datetime"`);
    await queryRunner.query(`
      ALTER TABLE "tour_slots"
        DROP CONSTRAINT IF EXISTS "chk_available_spots_non_negative"
    `);
    await queryRunner.query(`
      ALTER TABLE "tour_slots"
        DROP CONSTRAINT IF EXISTS "FK_tour_slots_tour_id"
    `);
    await queryRunner.query(`DROP TABLE "tour_slots"`);
  }
}
