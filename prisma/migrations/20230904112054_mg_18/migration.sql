-- AlterTable
ALTER TABLE `posts` ADD COLUMN `type` ENUM('public', 'private', 'friends') NOT NULL DEFAULT 'public';
