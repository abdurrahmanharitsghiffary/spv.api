/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `Token` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `token` DROP FOREIGN KEY `token_userId_fkey`;

-- DropIndex
DROP INDEX `token_userId_type_key` ON `token`;

-- CreateIndex
CREATE UNIQUE INDEX `Token_token_key` ON `Token`(`token`);

-- AddForeignKey
ALTER TABLE `Token` ADD CONSTRAINT `Token_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
