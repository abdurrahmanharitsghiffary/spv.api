"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeChatParticipant = exports.normalizeChat = void 0;
const normalizeChat = (chat) => new Promise((resolve) => {
    var _a, _b;
    const normalizedChat = {
        id: chat.id,
        message: chat.message,
        attachments: (_a = chat.chatImage) !== null && _a !== void 0 ? _a : [],
        readedBy: chat.readedBy.map((read) => {
            var _a;
            return ({
                avatarImage: (_a = read.user.profile) === null || _a === void 0 ? void 0 : _a.avatarImage,
                firstName: read.user.firstName,
                fullName: read.user.fullName,
                lastName: read.user.lastName,
                id: read.user.id,
                isOnline: read.user.isOnline,
                readedAt: read.createdAt,
                username: read.user.username,
            });
        }),
        isGroupChat: chat.chatRoom.isGroupChat,
        author: {
            id: chat.author.id,
            fullName: chat.author.fullName,
            isOnline: chat.author.isOnline,
            firstName: chat.author.firstName,
            lastName: chat.author.lastName,
            username: chat.author.username,
            avatarImage: (_b = chat.author.profile) === null || _b === void 0 ? void 0 : _b.avatarImage,
        },
        roomId: chat.chatRoomId,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
    };
    // if (normalizedChat?.author?.avatarImage)
    //   normalizedChat.author.avatarImage = {
    //     src: new URL(normalizedChat.author.avatarImage.src, BASE_URL).href,
    //   };
    // if (normalizedChat?.recipient?.avatarImage)
    //   normalizedChat.recipient.avatarImage = {
    //     src: new URL(normalizedChat.recipient.avatarImage.src, BASE_URL).href,
    //   };
    // if (chat?.chatImage) {
    //   normalizedChat.attachments = {
    //     src: new URL(chat.chatImage?.src, BASE_URL).href,
    //   };
    // }
    return resolve(normalizedChat);
});
exports.normalizeChat = normalizeChat;
const normalizeChatParticipant = (payload) => new Promise((resolve) => {
    var _a;
    return resolve({
        avatarImage: (_a = payload.user.profile) === null || _a === void 0 ? void 0 : _a.avatarImage,
        firstName: payload.user.firstName,
        lastName: payload.user.lastName,
        fullName: payload.user.fullName,
        id: payload.user.id,
        isOnline: payload.user.isOnline,
        joinedAt: payload.createdAt,
        role: payload.role,
        username: payload.user.username,
    });
});
exports.normalizeChatParticipant = normalizeChatParticipant;
