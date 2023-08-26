/*
  Warnings:

  - You are about to drop the column `description` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the `_commentreply` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_commentreply` DROP FOREIGN KEY `_CommentReply_A_fkey`;

-- DropForeignKey
ALTER TABLE `_commentreply` DROP FOREIGN KEY `_CommentReply_B_fkey`;

-- AlterTable
ALTER TABLE `comments` ADD COLUMN `parentId` INTEGER NULL;

-- AlterTable
ALTER TABLE `profiles` DROP COLUMN `description`,
    ADD COLUMN `profileDescription` TEXT NULL;

-- DropTable
DROP TABLE `_commentreply`;

-- AddForeignKey
ALTER TABLE `comments` ADD CONSTRAINT `comments_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `comments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
