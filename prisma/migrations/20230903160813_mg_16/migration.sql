/*
  Warnings:

  - You are about to drop the column `refresh_token` on the `token` table. All the data in the column will be lost.
  - You are about to drop the `reset_token` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[chatId]` on the table `images` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[token]` on the table `token` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `expires_in` to the `token` table without a default value. This is not possible if the table is not empty.
  - Added the required column `token` to the `token` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `token` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `reset_token` DROP FOREIGN KEY `reset_token_userId_fkey`;

-- DropIndex
DROP INDEX `token_refresh_token_key` ON `token`;

-- AlterTable
ALTER TABLE `images` ADD COLUMN `chatId` INTEGER NULL;

-- AlterTable
ALTER TABLE `token` DROP COLUMN `refresh_token`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `expires_in` DATETIME(3) NOT NULL,
    ADD COLUMN `token` VARCHAR(255) NOT NULL,
    ADD COLUMN `type` ENUM('reset_token', 'verify_token') NOT NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `verified` BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE `reset_token`;

-- CreateTable
CREATE TABLE `refresh_token` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `refresh_token` VARCHAR(255) NOT NULL,
    `userId` INTEGER NOT NULL,

    UNIQUE INDEX `refresh_token_refresh_token_key`(`refresh_token`),
    UNIQUE INDEX `refresh_token_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Chat` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `message` TEXT NULL,
    `authorId` INTEGER NOT NULL,
    `recipientId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `images_chatId_key` ON `images`(`chatId`);

-- CreateIndex
CREATE UNIQUE INDEX `token_token_key` ON `token`(`token`);

-- AddForeignKey
ALTER TABLE `images` ADD CONSTRAINT `images_chatId_fkey` FOREIGN KEY (`chatId`) REFERENCES `Chat`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `refresh_token` ADD CONSTRAINT `refresh_token_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Chat` ADD CONSTRAINT `Chat_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Chat` ADD CONSTRAINT `Chat_recipientId_fkey` FOREIGN KEY (`recipientId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
