/*
  Warnings:

  - You are about to drop the column `userId` on the `postlike` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `postlike` DROP FOREIGN KEY `PostLike_userId_fkey`;

-- AlterTable
ALTER TABLE `postlike` DROP COLUMN `userId`,
    MODIFY `id` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `PostLike` ADD CONSTRAINT `PostLike_id_fkey` FOREIGN KEY (`id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
