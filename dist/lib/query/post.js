"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectPost = void 0;
// export const selectAuthorPost = {
//   author: {
//     select: selectUserSimplified,
//   },
// } satisfies Prisma.PostSelect;
// export type SelectAuthorPost = Prisma.PostGetPayload<{
//   select: typeof selectAuthorPost;
// }>;
exports.selectPost = {
    id: true,
    title: true,
    content: true,
    updatedAt: true,
    _count: { select: { likes: true, comments: true } },
    images: {
        select: {
            id: true,
            src: true,
        },
    },
    author: {
        select: {
            id: true,
            firstName: true,
            lastName: true,
            fullName: true,
            isOnline: true,
            username: true,
            profile: {
                select: {
                    avatarImage: {
                        select: {
                            id: true,
                            src: true,
                        },
                    },
                },
            },
        },
    },
    createdAt: true,
};
