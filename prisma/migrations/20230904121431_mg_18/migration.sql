/*
  Warnings:

  - You are about to alter the column `type` on the `token` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(0))` to `Enum(EnumId(2))`.

*/
-- AlterTable
ALTER TABLE `token` MODIFY `type` ENUM('reset_token', 'verify_token') NOT NULL;
