-- AlterTable
ALTER TABLE `harvest_batches` ADD COLUMN `remaining_quantity_kg` DECIMAL(10, 2) NULL;

-- Backfill data
UPDATE `harvest_batches` SET `remaining_quantity_kg` = `quantity_kg`;

-- AlterTable NOT NULL
ALTER TABLE `harvest_batches` MODIFY `remaining_quantity_kg` DECIMAL(10, 2) NOT NULL;

-- DropForeignKey
ALTER TABLE `ratings` DROP FOREIGN KEY `ratings_order_id_fkey`;

-- DropIndex
DROP INDEX `ratings_order_id_key` ON `ratings`;

-- AlterTable
ALTER TABLE `orders` ADD COLUMN `selected_fulfillment_option_id` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `ratings` DROP COLUMN `order_id`,
    ADD COLUMN `allocation_id` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `fulfillment_options` (
    `id` VARCHAR(191) NOT NULL,
    `order_id` VARCHAR(191) NOT NULL,
    `type` ENUM('single', 'split') NOT NULL DEFAULT 'single',
    `rank` INTEGER NOT NULL,
    `fulfilled_quantity_kg` DECIMAL(10, 2) NOT NULL,
    `shortage_quantity_kg` DECIMAL(10, 2) NOT NULL,
    `product_subtotal` INTEGER NOT NULL,
    `logistics_cost` INTEGER NOT NULL,
    `grand_total` INTEGER NOT NULL,
    `aggregate_quality_score` DECIMAL(5, 2) NOT NULL,
    `aggregate_reputation_score` DECIMAL(5, 2) NOT NULL,
    `aggregate_logistics_score` DECIMAL(5, 2) NOT NULL,
    `total_score` DECIMAL(6, 3) NOT NULL,
    `status` VARCHAR(40) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `fulfillment_options_order_id_rank_idx`(`order_id`, `rank`),
    UNIQUE INDEX `fulfillment_options_order_id_rank_key`(`order_id`, `rank`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fulfillment_allocations` (
    `id` VARCHAR(191) NOT NULL,
    `option_id` VARCHAR(191) NOT NULL,
    `batch_id` VARCHAR(191) NOT NULL,
    `allocated_quantity_kg` DECIMAL(10, 2) NOT NULL,
    `price_per_kg` INTEGER NOT NULL,
    `product_subtotal` INTEGER NOT NULL,
    `distance_km` DECIMAL(10, 2) NOT NULL,
    `duration_minutes` INTEGER NULL,
    `logistics_cost` INTEGER NOT NULL,
    `route_source` VARCHAR(40) NOT NULL,
    `route_geometry` JSON NULL,
    `quality_score` DECIMAL(5, 2) NOT NULL,
    `reputation_score` DECIMAL(5, 2) NOT NULL,
    `sequence` INTEGER NOT NULL DEFAULT 1,

    INDEX `fulfillment_allocations_option_id_sequence_idx`(`option_id`, `sequence`),
    INDEX `fulfillment_allocations_batch_id_idx`(`batch_id`),
    UNIQUE INDEX `fulfillment_allocations_option_id_batch_id_key`(`option_id`, `batch_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `ratings_allocation_id_key` ON `ratings`(`allocation_id`);

-- CreateIndex
DROP INDEX `harvest_batches_status_commodity_quality_score_idx` ON `harvest_batches`;
CREATE INDEX `harvest_batches_status_commodity_quality_score_available_date_idx` ON `harvest_batches`(`status`, `commodity`, `quality_score`, `available_date`);

-- AddForeignKey
ALTER TABLE `fulfillment_options` ADD CONSTRAINT `fulfillment_options_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fulfillment_allocations` ADD CONSTRAINT `fulfillment_allocations_option_id_fkey` FOREIGN KEY (`option_id`) REFERENCES `fulfillment_options`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fulfillment_allocations` ADD CONSTRAINT `fulfillment_allocations_batch_id_fkey` FOREIGN KEY (`batch_id`) REFERENCES `harvest_batches`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ratings` ADD CONSTRAINT `ratings_allocation_id_fkey` FOREIGN KEY (`allocation_id`) REFERENCES `fulfillment_allocations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
