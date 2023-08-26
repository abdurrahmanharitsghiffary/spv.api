-- AlterTable
ALTER TABLE `profiles` ADD COLUMN `image` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `users` MODIFY `hashedPassword` VARCHAR(100) NOT NULL;
