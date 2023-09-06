/*
  Warnings:

  - A unique constraint covering the columns `[token,userId]` on the table `token` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `token_token_key` ON `token`;

-- CreateIndex
CREATE UNIQUE INDEX `token_token_userId_key` ON `token`(`token`, `userId`);
