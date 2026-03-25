import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTourTable1774443407200 implements MigrationInterface {
    name = 'CreateTourTable1774443407200'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "waypoints" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tour_id" uuid NOT NULL, "lat" numeric(10,8) NOT NULL, "lng" numeric(11,8) NOT NULL, "order" integer NOT NULL, "label" character varying(100) NOT NULL, CONSTRAINT "PK_767da123db02490889bd6eaab4e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."tours_category_enum" AS ENUM('cultural', 'nature', 'gastronomy', 'adventure', 'urban')`);
        await queryRunner.query(`CREATE TYPE "public"."tours_status_enum" AS ENUM('draft', 'published', 'archived')`);
        await queryRunner.query(`CREATE TABLE "tours" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(200) NOT NULL, "description" text NOT NULL, "short_description" character varying(300) NOT NULL, "category" "public"."tours_category_enum" NOT NULL, "price_per_person" numeric(10,2) NOT NULL, "duration_hours" numeric(4,1) NOT NULL, "max_capacity" integer NOT NULL, "language" text NOT NULL, "images" text NOT NULL, "status" "public"."tours_status_enum" NOT NULL DEFAULT 'draft', "meeting_point" character varying(300) NOT NULL, "meeting_point_lat" numeric(10,8) NOT NULL, "meeting_point_lng" numeric(11,8) NOT NULL, "operator_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_2202ba445792c1ad0edf2de8de2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "waypoints" ADD CONSTRAINT "FK_125a106e7408b9bbfa3370e9f97" FOREIGN KEY ("tour_id") REFERENCES "tours"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tours" ADD CONSTRAINT "FK_6e27f36f709246ddd251fae66c7" FOREIGN KEY ("operator_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tours" ADD COLUMN "search_vector" tsvector GENERATED ALWAYS AS (setweight(to_tsvector('spanish', coalesce(title, '')), 'A') || setweight(to_tsvector('spanish', coalesce(description, '')), 'B')) STORED`);
        await queryRunner.query(`CREATE INDEX "idx_tours_search_vector" ON "tours" USING GIN("search_vector")`);
        await queryRunner.query(`CREATE INDEX "idx_tours_status_category" ON "tours"("status", "category")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_tours_search_vector"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_tours_status_category"`);
        await queryRunner.query(`ALTER TABLE "tours" DROP COLUMN IF EXISTS "search_vector"`);
        await queryRunner.query(`ALTER TABLE "tours" DROP CONSTRAINT "FK_6e27f36f709246ddd251fae66c7"`);
        await queryRunner.query(`ALTER TABLE "waypoints" DROP CONSTRAINT "FK_125a106e7408b9bbfa3370e9f97"`);
        await queryRunner.query(`DROP TABLE "tours"`);
        await queryRunner.query(`DROP TYPE "public"."tours_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."tours_category_enum"`);
        await queryRunner.query(`DROP TABLE "waypoints"`);
    }

}
