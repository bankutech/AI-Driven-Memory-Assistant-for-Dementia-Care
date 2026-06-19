-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `role` ENUM('PATIENT', 'CAREGIVER', 'ADMIN') NOT NULL DEFAULT 'PATIENT',
    `phone` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PatientProfile` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `dateOfBirth` DATETIME(3) NULL,
    `bloodType` VARCHAR(191) NULL,
    `medicalInfo` TEXT NULL,
    `emergencyContact` VARCHAR(191) NULL,

    UNIQUE INDEX `PatientProfile_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CaregiverPatient` (
    `caregiverId` INTEGER NOT NULL,
    `patientId` INTEGER NOT NULL,

    PRIMARY KEY (`caregiverId`, `patientId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MemoryRecord` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `patientId` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `mediaUrl` VARCHAR(191) NULL,
    `mediaType` VARCHAR(191) NULL,
    `date` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FamilyMember` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `patientId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `relationship` VARCHAR(191) NOT NULL,
    `dateOfBirth` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `photoUrl` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LocationHistory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `patientId` INTEGER NOT NULL,
    `latitude` DOUBLE NOT NULL,
    `longitude` DOUBLE NOT NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Medication` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `patientId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `dosage` VARCHAR(191) NOT NULL,
    `instructions` TEXT NULL,
    `schedule` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MedicationLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `medicationId` INTEGER NOT NULL,
    `takenAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HealthLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `patientId` INTEGER NOT NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `mood` VARCHAR(191) NULL,
    `sleepQuality` VARCHAR(191) NULL,
    `dailyActivities` TEXT NULL,
    `notes` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PatientProfile` ADD CONSTRAINT `PatientProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CaregiverPatient` ADD CONSTRAINT `CaregiverPatient_caregiverId_fkey` FOREIGN KEY (`caregiverId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CaregiverPatient` ADD CONSTRAINT `CaregiverPatient_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MemoryRecord` ADD CONSTRAINT `MemoryRecord_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FamilyMember` ADD CONSTRAINT `FamilyMember_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LocationHistory` ADD CONSTRAINT `LocationHistory_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Medication` ADD CONSTRAINT `Medication_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MedicationLog` ADD CONSTRAINT `MedicationLog_medicationId_fkey` FOREIGN KEY (`medicationId`) REFERENCES `Medication`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HealthLog` ADD CONSTRAINT `HealthLog_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
