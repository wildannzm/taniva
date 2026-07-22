-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `email` VARCHAR(255) NULL,
    `password_hash` VARCHAR(191) NULL,
    `role` ENUM('farmer', 'umkm', 'admin') NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `farmers` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `farm_name` VARCHAR(160) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `latitude` DOUBLE NOT NULL,
    `longitude` DOUBLE NOT NULL,
    `reputation_score` DECIMAL(5, 2) NOT NULL DEFAULT 80,
    `rating_count` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `farmers_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `umkms` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `business_name` VARCHAR(160) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `latitude` DOUBLE NOT NULL,
    `longitude` DOUBLE NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `umkms_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `harvest_batches` (
    `id` VARCHAR(191) NOT NULL,
    `farmer_id` VARCHAR(191) NOT NULL,
    `commodity` VARCHAR(40) NOT NULL,
    `quantity_kg` DECIMAL(10, 2) NOT NULL,
    `price_per_kg` INTEGER NOT NULL,
    `available_date` DATE NOT NULL,
    `original_image_url` VARCHAR(191) NOT NULL,
    `annotated_image_url` VARCHAR(191) NULL,
    `quality_score` DECIMAL(5, 2) NULL,
    `quality_label` ENUM('fresh', 'mixed', 'rotten') NULL,
    `fresh_count` INTEGER NULL,
    `rotten_count` INTEGER NULL,
    `total_detected` INTEGER NULL,
    `ai_result_json` JSON NULL,
    `ai_source` VARCHAR(40) NULL,
    `status` ENUM('draft', 'analyzing', 'available', 'matched', 'sold', 'cancelled') NOT NULL DEFAULT 'draft',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `harvest_batches_farmer_id_idx`(`farmer_id`),
    INDEX `harvest_batches_status_commodity_quality_score_idx`(`status`, `commodity`, `quality_score`),
    INDEX `harvest_batches_available_date_idx`(`available_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `certificates` (
    `id` VARCHAR(191) NOT NULL,
    `batch_id` VARCHAR(191) NOT NULL,
    `certificate_code` VARCHAR(32) NOT NULL,
    `snapshot_json` JSON NOT NULL,
    `hash_sha256` CHAR(64) NOT NULL,
    `verify_url` VARCHAR(191) NOT NULL,
    `qr_image_url` VARCHAR(191) NOT NULL,
    `issued_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `certificates_batch_id_key`(`batch_id`),
    UNIQUE INDEX `certificates_certificate_code_key`(`certificate_code`),
    UNIQUE INDEX `certificates_hash_sha256_key`(`hash_sha256`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orders` (
    `id` VARCHAR(191) NOT NULL,
    `umkm_id` VARCHAR(191) NOT NULL,
    `raw_text` VARCHAR(191) NOT NULL,
    `commodity` VARCHAR(40) NOT NULL,
    `quantity_kg` DECIMAL(10, 2) NOT NULL,
    `minimum_quality` DECIMAL(5, 2) NOT NULL,
    `needed_date` DATE NOT NULL,
    `latitude` DOUBLE NOT NULL,
    `longitude` DOUBLE NOT NULL,
    `selected_batch_id` VARCHAR(191) NULL,
    `status` ENUM('draft', 'confirmed', 'matched', 'received', 'completed', 'cancelled') NOT NULL DEFAULT 'draft',
    `nlp_source` VARCHAR(40) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `orders_umkm_id_status_idx`(`umkm_id`, `status`),
    INDEX `orders_selected_batch_id_idx`(`selected_batch_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `match_results` (
    `id` VARCHAR(191) NOT NULL,
    `order_id` VARCHAR(191) NOT NULL,
    `batch_id` VARCHAR(191) NOT NULL,
    `quality_score` DECIMAL(5, 2) NOT NULL,
    `reputation_score` DECIMAL(5, 2) NOT NULL,
    `logistics_score` DECIMAL(5, 2) NOT NULL,
    `quality_contribution` DECIMAL(6, 3) NOT NULL,
    `reputation_contribution` DECIMAL(6, 3) NOT NULL,
    `logistics_contribution` DECIMAL(6, 3) NOT NULL,
    `total_score` DECIMAL(6, 3) NOT NULL,
    `distance_km` DECIMAL(10, 2) NOT NULL,
    `duration_minutes` INTEGER NULL,
    `estimated_cost` INTEGER NOT NULL,
    `route_source` VARCHAR(40) NOT NULL,
    `rank` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `match_results_order_id_rank_idx`(`order_id`, `rank`),
    INDEX `match_results_batch_id_idx`(`batch_id`),
    UNIQUE INDEX `match_results_order_id_batch_id_key`(`order_id`, `batch_id`),
    UNIQUE INDEX `match_results_order_id_rank_key`(`order_id`, `rank`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ratings` (
    `id` VARCHAR(191) NOT NULL,
    `order_id` VARCHAR(191) NOT NULL,
    `farmer_id` VARCHAR(191) NOT NULL,
    `umkm_id` VARCHAR(191) NOT NULL,
    `score` INTEGER NOT NULL,
    `comment` VARCHAR(191) NULL,
    `old_reputation_score` DECIMAL(5, 2) NOT NULL,
    `new_reputation_score` DECIMAL(5, 2) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ratings_order_id_key`(`order_id`),
    INDEX `ratings_farmer_id_idx`(`farmer_id`),
    INDEX `ratings_umkm_id_idx`(`umkm_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `farmers` ADD CONSTRAINT `farmers_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `umkms` ADD CONSTRAINT `umkms_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `harvest_batches` ADD CONSTRAINT `harvest_batches_farmer_id_fkey` FOREIGN KEY (`farmer_id`) REFERENCES `farmers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `certificates` ADD CONSTRAINT `certificates_batch_id_fkey` FOREIGN KEY (`batch_id`) REFERENCES `harvest_batches`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_umkm_id_fkey` FOREIGN KEY (`umkm_id`) REFERENCES `umkms`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_selected_batch_id_fkey` FOREIGN KEY (`selected_batch_id`) REFERENCES `harvest_batches`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `match_results` ADD CONSTRAINT `match_results_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `match_results` ADD CONSTRAINT `match_results_batch_id_fkey` FOREIGN KEY (`batch_id`) REFERENCES `harvest_batches`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ratings` ADD CONSTRAINT `ratings_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ratings` ADD CONSTRAINT `ratings_farmer_id_fkey` FOREIGN KEY (`farmer_id`) REFERENCES `farmers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ratings` ADD CONSTRAINT `ratings_umkm_id_fkey` FOREIGN KEY (`umkm_id`) REFERENCES `umkms`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
