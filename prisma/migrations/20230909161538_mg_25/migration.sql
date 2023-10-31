-- AlterTable
ALTER TABLE `posts` MODIFY `title` VARCHAR(255) NOT NULL;

-- CreateTable
CREATE TABLE `comment_likes` (
    `userId` INTEGER NOT NULL,
    `commentId` INTEGER NOT NULL,

    PRIMARY KEY (`userId`, `commentId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `comment_likes` ADD CONSTRAINT `comment_likes_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comment_likes` ADD CONSTRAINT `comment_likes_commentId_fkey` FOREIGN KEY (`commentId`) REFERENCES `comments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
