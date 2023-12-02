import { $Enums } from "@prisma/client";

export interface NotificationBase {
  type: $Enums.NotificationType;
  createdAt: Date;
  updatedAt: Date;
}
