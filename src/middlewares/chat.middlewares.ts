import express from "express";
import { ExpressRequestExtended } from "../types/request";
import { ForbiddenError } from "../lib/error";
import Chat from "../models/chat.models";

export const protectChat = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { userId } = req as ExpressRequestExtended;
  const { messageId } = req.params;

  const chat = await Chat.findUnique({
    where: { id: Number(messageId) },
    select: { authorId: true, id: true },
  });
  if (chat?.authorId !== Number(userId)) throw new ForbiddenError();

  return next();
};

export const parseParticipantsField = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  console.log(req.body, "bodyy");
  if (req.body.participants)
    req.body.participants = (req.body?.participants ?? []).map(
      (participant: any) => {
        console.log(participant[0]);
        return JSON.parse(participant)[0];
      }
    );

  return next();
};
