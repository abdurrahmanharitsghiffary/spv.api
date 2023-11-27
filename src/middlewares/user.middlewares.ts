import express from "express";
import { tryCatchMiddleware } from "./handler.middlewares";
import { ExpressRequestExtended } from "../types/request";
import User from "../models/user.models";
import { ApiError } from "../utils/response";

type CustomMessage =
  | { blockedMessage?: string; blockingMessage?: string }
  | undefined;

const blockedMessage =
  "You do not have permission to access this user's information because you have been blocked by this user.";
const blockingMessage =
  "You do not have permission to access this user's information because you have blocked them.";

const blockingResponse = (
  res: express.Response<any, Record<string, any>>,
  customMessage?: string
) => res.status(403).json(new ApiError(403, customMessage ?? blockingMessage));

const blockedResponse = (
  res: express.Response<any, Record<string, any>>,
  customMessage?: string
) => res.status(403).json(new ApiError(403, customMessage ?? blockedMessage));

const isBlockingUser = ({
  currentUserId,
  blockedUserId,
}: {
  currentUserId: number;
  blockedUserId: number;
}) =>
  User.findUnique({
    where: {
      id: Number(currentUserId),
    },
    select: {
      id: true,
      blocked: {
        select: {
          id: true,
        },
        where: {
          id: Number(blockedUserId),
        },
      },
    },
  });

const isBlockedByUser = ({
  currentUserId,
  blockingUserId,
}: {
  currentUserId: number;
  blockingUserId: number;
}) =>
  User.findUnique({
    where: {
      id: Number(currentUserId),
    },
    select: {
      id: true,
      blocking: {
        select: {
          id: true,
        },
        where: {
          id: Number(blockingUserId),
        },
      },
    },
  });

export const isUserBlockOrBlocked_Params = (
  paramsKey: string = "userId",
  customMessage?: CustomMessage
) =>
  tryCatchMiddleware(
    async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      const { userId: loggedUserId } = req as ExpressRequestExtended;

      const blockingUser = await isBlockingUser({
        blockedUserId: Number(req.params[paramsKey]),
        currentUserId: Number(loggedUserId),
      });

      const isBlocking =
        (blockingUser?.blocked ?? []).length > 0 ? true : false;

      const blockedUser = await isBlockedByUser({
        blockingUserId: Number(req.params[paramsKey]),
        currentUserId: Number(loggedUserId),
      });

      const isBlocked = (blockedUser?.blocking ?? []).length > 0 ? true : false;

      if (isBlocked) return blockedResponse(res, customMessage?.blockedMessage);

      if (isBlocking)
        return blockingResponse(res, customMessage?.blockingMessage);

      return next();
    }
  );

export const isUserBlockOrBlocked_Body = (
  bodyKey: string,
  customMessage?: CustomMessage
) =>
  tryCatchMiddleware(
    async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      const { userId: loggedUserId } = req as ExpressRequestExtended;

      const blockingUser = await isBlockingUser({
        blockedUserId: Number(req.body[bodyKey]),
        currentUserId: Number(loggedUserId),
      });

      const isBlocking =
        (blockingUser?.blocked ?? []).length > 0 ? true : false;

      const blockedUser = await isBlockedByUser({
        blockingUserId: Number(req.body[bodyKey]),
        currentUserId: Number(loggedUserId),
      });

      const isBlocked = (blockedUser?.blocking ?? []).length > 0 ? true : false;

      if (isBlocked) return blockedResponse(res, customMessage?.blockedMessage);

      if (isBlocking)
        return blockingResponse(res, customMessage?.blockingMessage);

      return next();
    }
  );
