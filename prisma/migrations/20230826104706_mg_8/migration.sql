/*
  Warnings:

  - You are about to drop the column `name` on the `images` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `images` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `images` DROP COLUMN `name`,
    DROP COLUMN `type`;
