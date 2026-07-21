-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('farmer', 'umkm', 'admin');

-- CreateEnum
CREATE TYPE "harvest_status" AS ENUM ('draft', 'analyzing', 'available', 'matched', 'sold', 'cancelled');

-- CreateEnum
CREATE TYPE "order_status" AS ENUM ('draft', 'confirmed', 'matched', 'received', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "quality_label" AS ENUM ('fresh', 'mixed', 'rotten');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "email" VARCHAR(255),
    "password_hash" TEXT,
    "role" "user_role" NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "farmers" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "farm_name" VARCHAR(160) NOT NULL,
    "address" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "reputation_score" DECIMAL(5,2) NOT NULL DEFAULT 80,
    "rating_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "farmers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "umkms" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "business_name" VARCHAR(160) NOT NULL,
    "address" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "umkms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "harvest_batches" (
    "id" UUID NOT NULL,
    "farmer_id" UUID NOT NULL,
    "commodity" VARCHAR(40) NOT NULL,
    "quantity_kg" DECIMAL(10,2) NOT NULL,
    "price_per_kg" INTEGER NOT NULL,
    "available_date" DATE NOT NULL,
    "original_image_url" TEXT NOT NULL,
    "annotated_image_url" TEXT,
    "quality_score" DECIMAL(5,2),
    "quality_label" "quality_label",
    "fresh_count" INTEGER,
    "rotten_count" INTEGER,
    "total_detected" INTEGER,
    "ai_result_json" JSONB,
    "ai_source" VARCHAR(40),
    "status" "harvest_status" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "harvest_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificates" (
    "id" UUID NOT NULL,
    "batch_id" UUID NOT NULL,
    "certificate_code" VARCHAR(32) NOT NULL,
    "snapshot_json" JSONB NOT NULL,
    "hash_sha256" CHAR(64) NOT NULL,
    "verify_url" TEXT NOT NULL,
    "qr_image_url" TEXT NOT NULL,
    "issued_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "certificates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" UUID NOT NULL,
    "umkm_id" UUID NOT NULL,
    "raw_text" TEXT NOT NULL,
    "commodity" VARCHAR(40) NOT NULL,
    "quantity_kg" DECIMAL(10,2) NOT NULL,
    "minimum_quality" DECIMAL(5,2) NOT NULL,
    "needed_date" DATE NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "selected_batch_id" UUID,
    "status" "order_status" NOT NULL DEFAULT 'draft',
    "nlp_source" VARCHAR(40),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_results" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "batch_id" UUID NOT NULL,
    "quality_score" DECIMAL(5,2) NOT NULL,
    "reputation_score" DECIMAL(5,2) NOT NULL,
    "logistics_score" DECIMAL(5,2) NOT NULL,
    "quality_contribution" DECIMAL(6,3) NOT NULL,
    "reputation_contribution" DECIMAL(6,3) NOT NULL,
    "logistics_contribution" DECIMAL(6,3) NOT NULL,
    "total_score" DECIMAL(6,3) NOT NULL,
    "distance_km" DECIMAL(10,2) NOT NULL,
    "duration_minutes" INTEGER,
    "estimated_cost" INTEGER NOT NULL,
    "route_source" VARCHAR(40) NOT NULL,
    "rank" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "match_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ratings" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "farmer_id" UUID NOT NULL,
    "umkm_id" UUID NOT NULL,
    "score" INTEGER NOT NULL,
    "comment" TEXT,
    "old_reputation_score" DECIMAL(5,2) NOT NULL,
    "new_reputation_score" DECIMAL(5,2) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ratings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "farmers_user_id_key" ON "farmers"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "umkms_user_id_key" ON "umkms"("user_id");

-- CreateIndex
CREATE INDEX "harvest_batches_farmer_id_idx" ON "harvest_batches"("farmer_id");

-- CreateIndex
CREATE INDEX "harvest_batches_status_commodity_quality_score_idx" ON "harvest_batches"("status", "commodity", "quality_score");

-- CreateIndex
CREATE INDEX "harvest_batches_available_date_idx" ON "harvest_batches"("available_date");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_batch_id_key" ON "certificates"("batch_id");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_certificate_code_key" ON "certificates"("certificate_code");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_hash_sha256_key" ON "certificates"("hash_sha256");

-- CreateIndex
CREATE INDEX "orders_umkm_id_status_idx" ON "orders"("umkm_id", "status");

-- CreateIndex
CREATE INDEX "orders_selected_batch_id_idx" ON "orders"("selected_batch_id");

-- CreateIndex
CREATE INDEX "match_results_order_id_rank_idx" ON "match_results"("order_id", "rank");

-- CreateIndex
CREATE INDEX "match_results_batch_id_idx" ON "match_results"("batch_id");

-- CreateIndex
CREATE UNIQUE INDEX "match_results_order_id_batch_id_key" ON "match_results"("order_id", "batch_id");

-- CreateIndex
CREATE UNIQUE INDEX "match_results_order_id_rank_key" ON "match_results"("order_id", "rank");

-- CreateIndex
CREATE UNIQUE INDEX "ratings_order_id_key" ON "ratings"("order_id");

-- CreateIndex
CREATE INDEX "ratings_farmer_id_idx" ON "ratings"("farmer_id");

-- CreateIndex
CREATE INDEX "ratings_umkm_id_idx" ON "ratings"("umkm_id");

-- AddForeignKey
ALTER TABLE "farmers" ADD CONSTRAINT "farmers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "umkms" ADD CONSTRAINT "umkms_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "harvest_batches" ADD CONSTRAINT "harvest_batches_farmer_id_fkey" FOREIGN KEY ("farmer_id") REFERENCES "farmers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "harvest_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_umkm_id_fkey" FOREIGN KEY ("umkm_id") REFERENCES "umkms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_selected_batch_id_fkey" FOREIGN KEY ("selected_batch_id") REFERENCES "harvest_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_results" ADD CONSTRAINT "match_results_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_results" ADD CONSTRAINT "match_results_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "harvest_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_farmer_id_fkey" FOREIGN KEY ("farmer_id") REFERENCES "farmers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_umkm_id_fkey" FOREIGN KEY ("umkm_id") REFERENCES "umkms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
