-- DropForeignKey
ALTER TABLE `profiles` DROP FOREIGN KEY `profiles_userId_fkey`;

-- AlterTable
ALTER TABLE `profiles` MODIFY `userId` VARCHAR(100) NOT NULL;

-- AddForeignKey
ALTER TABLE `profiles` ADD CONSTRAINT `profiles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`email`) ON DELETE CASCADE ON UPDATE CASCADE;
