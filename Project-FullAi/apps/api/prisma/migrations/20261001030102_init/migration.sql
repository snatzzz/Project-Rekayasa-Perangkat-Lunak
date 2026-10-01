-- CreateTable
CREATE TABLE `motorcycles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `brand` VARCHAR(191) NOT NULL,
    `model` VARCHAR(191) NOT NULL,
    `year` INTEGER NOT NULL,
    `currentMileage` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mileage_records` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `motorcycleId` INTEGER NOT NULL,
    `mileage` INTEGER NOT NULL,
    `recordedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `mileage_records_motorcycleId_idx`(`motorcycleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `service_histories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `motorcycleId` INTEGER NOT NULL,
    `serviceType` VARCHAR(191) NOT NULL,
    `serviceDate` DATETIME(3) NOT NULL,
    `mileage` INTEGER NOT NULL,
    `cost` DOUBLE NOT NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `service_histories_motorcycleId_idx`(`motorcycleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `maintenance_schedules` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `motorcycleId` INTEGER NOT NULL,
    `maintenanceType` VARCHAR(191) NOT NULL,
    `intervalKm` INTEGER NOT NULL,
    `intervalDays` INTEGER NOT NULL,
    `lastServiceMileage` INTEGER NOT NULL,
    `lastServiceDate` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `maintenance_schedules_motorcycleId_idx`(`motorcycleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `mileage_records` ADD CONSTRAINT `mileage_records_motorcycleId_fkey` FOREIGN KEY (`motorcycleId`) REFERENCES `motorcycles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `service_histories` ADD CONSTRAINT `service_histories_motorcycleId_fkey` FOREIGN KEY (`motorcycleId`) REFERENCES `motorcycles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `maintenance_schedules` ADD CONSTRAINT `maintenance_schedules_motorcycleId_fkey` FOREIGN KEY (`motorcycleId`) REFERENCES `motorcycles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
