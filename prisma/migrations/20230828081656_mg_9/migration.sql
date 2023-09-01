/*
  Warnings:

  - You are about to drop the `_userfollows` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `title` on table `posts` required. This step will fail if there are existing NULL values in that column.
  - Made the column `content` on table `posts` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `_userfollows` DROP FOREIGN KEY `_UserFollows_A_fkey`;

-- DropForeignKey
ALTER TABLE `_userfollows` DROP FOREIGN KEY `_UserFollows_B_fkey`;

-- AlterTable
ALTER TABLE `posts` MODIFY `title` VARCHAR(80) NOT NULL,
    MODIFY `content` TEXT NOT NULL;

-- DropTable
DROP TABLE `_userfollows`;

-- CreateTable
CREATE TABLE `followers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `followerId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `following` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `followedUserId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `followers` ADD CONSTRAINT `followers_followerId_fkey` FOREIGN KEY (`followerId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `following` ADD CONSTRAINT `following_followedUserId_fkey` FOREIGN KEY (`followedUserId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
