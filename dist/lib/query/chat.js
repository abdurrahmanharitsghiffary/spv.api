"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectRoomParticipant = exports.selectChatRoomWithWhereInput = exports.selectChatRoomPWL = exports.selectChatRoom = exports.selectChat = void 0;
const user_1 = require("./user");
const unreadMessagesFilter = (currentUserId) => ({
    select: {
        messages: {
            where: {
                authorId: {
                    not: currentUserId,
                },
                AND: [
                    {
                        readedBy: {
                            every: {
                                userId: {
                                    not: currentUserId,
                                },
                            },
                        },
                    },
                ],
            },
        },
    },
});
exports.selectChat = {
    id: true,
    message: true,
    chatImage: {
        select: {
            id: true,
            src: true,
        },
    },
    chatRoom: {
        select: {
            isGroupChat: true,
        },
    },
    readedBy: {
        select: {
            createdAt: true,
            user: {
                select: user_1.selectUserSimplified,
            },
        },
        // where: {
        //   userId: {
        //     not: currentUserId,
        //   },
        // },
    },
    author: {
        select: Object.assign({}, user_1.selectUserSimplified),
    },
    chatRoomId: true,
    createdAt: true,
    updatedAt: true,
};
// Prisma.ChatGetPayload<{
//   select: typeof selectChat;
// }>;
const selectChatRoom = (currentUserId) => ({
    groupPicture: {
        select: {
            src: true,
            id: true,
        },
    },
    id: true,
    createdAt: true,
    description: true,
    isGroupChat: true,
    title: true,
    updatedAt: true,
    messages: {
        select: Object.assign({}, exports.selectChat),
    },
    _count: {
        select: {
            participants: true,
            messages: Object.assign({}, unreadMessagesFilter(currentUserId).select.messages),
        },
    },
    participants: {
        orderBy: {
            createdAt: "asc",
        },
        take: 10,
        select: {
            chatRoomId: true,
            createdAt: true,
            role: true,
            user: {
                select: Object.assign({}, user_1.selectUserSimplified),
            },
        },
    },
});
exports.selectChatRoom = selectChatRoom;
const selectChatRoomPWL = (currentUserId) => (Object.assign(Object.assign({}, (0, exports.selectChatRoom)(currentUserId)), { participants: Object.assign(Object.assign({}, (0, exports.selectChatRoom)(currentUserId).participants), { take: undefined }) }));
exports.selectChatRoomPWL = selectChatRoomPWL;
// Prisma.ChatRoomGetPayload<{
//   select: typeof selectChatRoom;
// }>;
const selectChatRoomWithWhereInput = (userId) => ({
    groupPicture: {
        select: {
            src: true,
            id: true,
        },
    },
    participants: {
        take: 10,
        orderBy: {
            createdAt: "asc",
        },
        select: {
            chatRoomId: true,
            createdAt: true,
            role: true,
            user: {
                select: Object.assign({}, user_1.selectUserSimplified),
            },
        },
        where: {
            AND: [
                {
                    user: Object.assign(Object.assign({}, (0, user_1.excludeBlockedUser)(userId)), (0, user_1.excludeBlockingUser)(userId)),
                },
            ],
        },
    },
    id: true,
    createdAt: true,
    description: true,
    isGroupChat: true,
    title: true,
    updatedAt: true,
    messages: {
        select: Object.assign({}, exports.selectChat),
        orderBy: {
            createdAt: "desc",
        },
        take: 1,
        where: {
            AND: [
                {
                    author: Object.assign(Object.assign({}, (0, user_1.excludeBlockedUser)(userId)), (0, user_1.excludeBlockingUser)(userId)),
                },
            ],
        },
    },
    _count: {
        select: {
            participants: true,
            messages: Object.assign({}, unreadMessagesFilter(userId).select.messages),
        },
    },
});
exports.selectChatRoomWithWhereInput = selectChatRoomWithWhereInput;
exports.selectRoomParticipant = {
    role: true,
    createdAt: true,
    chatRoomId: true,
    user: { select: user_1.selectUserSimplified },
};
