import { $Enums, Prisma } from "@prisma/client";
import {
  excludeBlockedUser,
  excludeBlockingUser,
  selectUserSimplified,
} from "./user";

const unreadMessagesFilter = (currentUserId: number) =>
  ({
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
  } satisfies Prisma.ChatRoomSelect["_count"]);

export const selectChat = {
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
        select: selectUserSimplified,
      },
    },
    // where: {
    //   userId: {
    //     not: currentUserId,
    //   },
    // },
  },
  author: {
    select: {
      ...selectUserSimplified,
    },
  },
  chatRoomId: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ChatSelect;

export type SelectChatPayload = {
  id: number;
  message: string | null;
  chatRoomId: number;
  createdAt: Date;
  updatedAt: Date;
  chatRoom: {
    isGroupChat: boolean;
  };
  chatImage: {
    id: number;
    src: string;
  }[];
  readedBy: {
    createdAt: Date;
    user: {
      id: number;
      profile: {
        avatarImage: {
          id: number;
          src: string;
        } | null;
      } | null;
      firstName: string;
      lastName: string;
      fullName: string | null;
      username: string;
      isOnline: boolean;
    };
  }[];
  author: {
    id: number;
    profile: {
      avatarImage: {
        id: number;
        src: string;
      } | null;
    } | null;
    firstName: string;
    lastName: string;
    fullName: string | null;
    username: string;
    isOnline: boolean;
  };
};
// Prisma.ChatGetPayload<{
//   select: typeof selectChat;
// }>;

export const selectChatRoom = (currentUserId: number) =>
  ({
    groupPicture: {
      select: {
        src: true,
        id: true,
      },
    },
    id: true,
    applyType: true,
    groupVisibility: true,
    createdAt: true,
    description: true,
    isGroupChat: true,
    title: true,
    updatedAt: true,
    messages: {
      select: {
        ...selectChat,
      },
    },
    _count: {
      select: {
        participants: true,
        messages: {
          ...unreadMessagesFilter(currentUserId).select.messages,
        },
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
          select: {
            ...selectUserSimplified,
          },
        },
      },
    },
  } satisfies Prisma.ChatRoomSelect);

export const selectChatRoomPWL = (currentUserId: number) =>
  ({
    ...selectChatRoom(currentUserId),
    participants: {
      ...selectChatRoom(currentUserId).participants,
      take: undefined,
    },
  } satisfies Prisma.ChatRoomSelect);

export type SelectChatRoomPayload = {
  id: number;
  applyType: $Enums.ApplyType;
  groupVisibility: $Enums.GroupType;
  description: string | null;
  title: string | null;
  isGroupChat: boolean;
  createdAt: Date;
  updatedAt: Date;
  participants: {
    chatRoomId: number;
    createdAt: Date;
    user: {
      id: number;
      profile: {
        avatarImage: {
          id: number;
          src: string;
        } | null;
      } | null;
      firstName: string;
      lastName: string;
      fullName: string | null;
      username: string;
      isOnline: boolean;
    };
    role: $Enums.ParticipantRole;
  }[];
  messages: {
    chatRoom: {
      isGroupChat: boolean;
    };
    id: number;
    createdAt: Date;
    updatedAt: Date;
    message: string | null;
    chatRoomId: number;
    chatImage: {
      id: number;
      src: string;
    }[];
    readedBy: {
      createdAt: Date;
      user: {
        id: number;
        profile: {
          avatarImage: {
            id: number;
            src: string;
          } | null;
        } | null;
        firstName: string;
        lastName: string;
        fullName: string | null;
        username: string;
        isOnline: boolean;
      };
    }[];
    author: {
      id: number;
      profile: {
        avatarImage: {
          id: number;
          src: string;
        } | null;
      } | null;
      firstName: string;
      lastName: string;
      fullName: string | null;
      username: string;
      isOnline: boolean;
    };
  }[];
  groupPicture: {
    id: number;
    src: string;
  } | null;
  _count: {
    participants: number;
    messages: number;
  };
};
// Prisma.ChatRoomGetPayload<{
//   select: typeof selectChatRoom;
// }>;

export const selectChatRoomWithWhereInput = (userId: number) =>
  ({
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
          select: {
            ...selectUserSimplified,
          },
        },
      },
      where: {
        AND: [
          {
            user: {
              ...excludeBlockedUser(userId),
              ...excludeBlockingUser(userId),
            },
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
      select: {
        ...selectChat,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 1,
      where: {
        AND: [
          {
            author: {
              ...excludeBlockedUser(userId),
              ...excludeBlockingUser(userId),
            },
          },
        ],
      },
    },
    groupVisibility: true,
    applyType: true,
    _count: {
      select: {
        participants: true,
        messages: {
          ...unreadMessagesFilter(userId).select.messages,
        },
      },
    },
  } satisfies Prisma.ChatRoomSelect);

export const selectRoomParticipant = {
  role: true,
  createdAt: true,
  chatRoomId: true,
  user: { select: selectUserSimplified },
} satisfies Prisma.ChatRoomParticipantSelect;

export type ChatRoomParticipantPayload = Prisma.ChatRoomParticipantGetPayload<{
  select: typeof selectRoomParticipant;
}>;
