-- DropIndex
DROP INDEX `token_userId_type_key` ON `token`;

-- AlterTable
ALTER TABLE `token` MODIFY `type` ENUM('basic_token', 'reset_token', 'verify_token') NOT NULL DEFAULT 'basic_token';
