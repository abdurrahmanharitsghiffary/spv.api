import { SelectNotificationSimplifiedPayload } from "../../lib/query/notification";
import { Notification } from "../../types/notification";
import { simplifyUserWF } from "../user/user.normalize";

export const normalizeNotification = async (
  payload: SelectNotificationSimplifiedPayload
): Promise<Notification> =>
  new Promise(async (resolve) => {
    const normalizedNotification = {
      type: payload.type,
      senderId: payload.userId,
      receiverId: payload.receiverId,
      isRead: payload.isRead,
      id: payload.id,
      createdAt: payload.createdAt,
      updatedAt: payload.updatedAt,
    } as Notification;

    if (
      ["liking_comment", "replying_comment", "comment"].includes(
        normalizedNotification.type
      )
    ) {
      (normalizedNotification as any).commentId = payload.commentId as number;
      (normalizedNotification as any).postId = payload.postId as number;
    }

    if (normalizedNotification.type === "liking_post") {
      normalizedNotification.postId = payload.postId as number;
    }

    const sender = await simplifyUserWF(payload.user);
    const receiver = await simplifyUserWF(payload.receiver);

    return resolve({
      ...normalizedNotification,
      sender,
      receiver,
    });
  });
