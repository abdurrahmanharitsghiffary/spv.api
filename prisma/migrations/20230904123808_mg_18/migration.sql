/*
  Warnings:

  - A unique constraint covering the columns `[userId,type]` on the table `token` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `token_token_userId_key` ON `token`;

-- CreateIndex
CREATE UNIQUE INDEX `token_userId_type_key` ON `token`(`userId`, `type`);
