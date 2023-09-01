/*
  Warnings:

  - The primary key for the `postlike` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE `postlike` DROP PRIMARY KEY,
    ADD PRIMARY KEY (`id`, `postId`);
