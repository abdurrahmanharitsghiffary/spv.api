/*
  Warnings:

  - You are about to drop the column `refresh_token` on the `reset_token` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[reset_token]` on the table `reset_token` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `reset_token` to the `reset_token` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `reset_token_refresh_token_key` ON `reset_token`;

-- AlterTable
ALTER TABLE `reset_token` DROP COLUMN `refresh_token`,
    ADD COLUMN `reset_token` VARCHAR(255) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `reset_token_reset_token_key` ON `reset_token`(`reset_token`);
