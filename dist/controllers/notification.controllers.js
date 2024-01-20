"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearNotifications = exports.getAllUserNotifications = void 0;
const notification_models_1 = __importDefault(require("../models/notification.models"));
const response_1 = require("../utils/response");
const paging_1 = require("../utils/paging");
const user_1 = require("../lib/query/user");
const notification_1 = require("../lib/query/notification");
const notification_normalize_1 = require("../utils/notification/notification.normalize");
// const notificationSelect = (userId?: number | string) =>
//   ({
//     id: true,
//     type: true,
//     isRead: true,
//     user: {
//       select: {
//         ...selectUserSimplified,
//       },
//     },
//     post: {
//       select: {
//         id: true,
//         title: true,
//         content: true,
//         author: {
//           select: {
//             ...selectUserSimplified,
//           },
//         },
//       },
//       where: {
//         author: {
//           ...excludeBlockingUser(Number(userId)),
//           ...excludeBlockedUser(Number(userId)),
//         },
//       },
//     },
//     comment: {
//       select: {
//         id: true,
//         comment: true,
//         user: {
//           select: {
//             ...selectUserSimplified,
//           },
//         },
//       },
//       where: {
//         user: {
//           ...excludeBlockingUser(Number(userId)),
//           ...excludeBlockedUser(Number(userId)),
//         },
//       },
//     },
//     createdAt: true,
//     updatedAt: true,
//   } satisfies Prisma.NotificationSelect);
const notificationWhereAndInput = (userId) => [
    {
        user: Object.assign(Object.assign({}, (0, user_1.excludeBlockingUser)(Number(userId))), (0, user_1.excludeBlockedUser)(Number(userId))),
    },
    {
        post: {
            author: Object.assign(Object.assign({}, (0, user_1.excludeBlockingUser)(Number(userId))), (0, user_1.excludeBlockedUser)(Number(userId))),
        },
    },
    {
        comment: {
            user: Object.assign(Object.assign({}, (0, user_1.excludeBlockingUser)(Number(userId))), (0, user_1.excludeBlockedUser)(Number(userId))),
        },
    },
];
const getTimeQuery = (time) => {
    let num = 0;
    const extractTime = (time, options) => {
        var _a, _b;
        return (_b = (_a = time.split(options)) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : 0;
    };
    if (time.endsWith("y")) {
        num = Number(extractTime(time, "y")) * 60000 * 60 * 24 * 365;
    }
    else if (time.endsWith("d")) {
        num = Number(extractTime(time, "d")) * 60000 * 60 * 24;
    }
    else if (time.endsWith("h")) {
        num = Number(extractTime(time, "h")) * 60000 * 60;
    }
    if (!Number.isNaN(Number(time))) {
        num = Number(time);
    }
    return num;
};
const getAllUserNotifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { offset = 0, limit = 20, order_by = "latest" } = req.query;
    const { userId } = req;
    console.log(order_by, "Order By");
    const notifications = yield notification_models_1.default.findMany({
        where: {
            receiverId: Number(userId),
            // AND: notificationWhereAndInput(userId),
        },
        select: Object.assign({}, notification_1.selectNotificationSimplified),
        orderBy: {
            createdAt: order_by === "latest" ? "desc" : "asc",
        },
        take: Number(limit),
        skip: Number(offset),
    });
    const total_notifications = yield notification_models_1.default.count({
        where: {
            receiverId: Number(userId),
            AND: notificationWhereAndInput(userId),
        },
    });
    const normalizedNotifications = yield Promise.all(notifications.map((not) => Promise.resolve((0, notification_normalize_1.normalizeNotification)(not))));
    return res.status(200).json(yield (0, paging_1.getPagingObject)({
        req,
        data: normalizedNotifications,
        total_records: total_notifications,
    }));
});
exports.getAllUserNotifications = getAllUserNotifications;
const clearNotifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req;
    const { before_timestamp } = req.query;
    yield notification_models_1.default.deleteMany({
        where: {
            receiverId: Number(userId),
            createdAt: {
                gt: before_timestamp
                    ? new Date(Date.now() - getTimeQuery(before_timestamp))
                    : undefined,
            },
        },
    });
    return res.status(204).json(new response_1.ApiResponse(null, 204));
});
exports.clearNotifications = clearNotifications;
// export const createNotification = async (
//   req: express.Request,
//   res: express.Response
// ) => {
//   const { userId } = req as ExpressRequestExtended;
//   const { type, receiverId, postId, commentId } = req.body as {
//     type: NotificationType;
//     receiverId: string | number;
//     commentId?: number;
//     postId?: number;
//   };
//   let createdNotification: any = null;
//   const response = (data: any) =>
//     res.status(201).json(new ApiResponse(data, 201));
//   switch (type) {
//     case "comment":
//       {
//         createdNotification = await Notification.create({
//           data: {
//             type,
//             receiverId: Number(receiverId),
//             userId: Number(userId),
//             postId: Number(postId),
//           },
//           select: notificationSelect(userId),
//         });
//       }
//       break;
//     case "follow":
//       {
//         createdNotification = await Notification.create({
//           data: {
//             type,
//             receiverId: Number(receiverId),
//             userId: Number(userId),
//           },
//           select: notificationSelect(userId),
//         });
//       }
//       break;
//     case "liking_comment":
//       {
//         createdNotification = await Notification.create({
//           data: {
//             type,
//             receiverId: Number(receiverId),
//             userId: Number(userId),
//             commentId: Number(commentId),
//           },
//           select: notificationSelect(userId),
//         });
//       }
//       break;
//     case "liking_post":
//       {
//         createdNotification = await Notification.create({
//           data: {
//             type,
//             receiverId: Number(receiverId),
//             userId: Number(userId),
//             postId: Number(postId),
//           },
//           select: notificationSelect(userId),
//         });
//       }
//       break;
//     case "replying_comment":
//       {
//         createdNotification = await Notification.create({
//           data: {
//             type,
//             receiverId: Number(receiverId),
//             userId: Number(userId),
//             commentId: Number(commentId),
//           },
//           select: notificationSelect(userId),
//         });
//       }
//       break;
//     default: {
//       return null;
//     }
//   }
//   return response(createdNotification);
// };
