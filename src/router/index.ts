import { Express } from "express";
import userRouter from "./user.routes";
import authRouter from "./auth.routes";
import postRouter from "./post.routes";
import googleRouter from "./googleAuth.routes";
import messageRouter from "./messages.routes";
import commentRouter from "./comment.routes";
import meRouter from "./me.routes";
import accountRouter from "./account.routes";
import chatRouter from "./chat.routes";
import { refreshToken } from "../controllers/auth.controller";
import {
  verifyRefreshToken,
  verifyToken,
} from "../middlewares/auth.middlewares";
import { getSearchResults } from "../controllers/search.controllers";
import { tryCatch } from "../middlewares/handler.middlewares";
import { validate } from "../middlewares/validator.middlewares";
import { z } from "zod";
import { zLimit, zOffset } from "../schema";
import User from "../models/user.models";
import { selectUser } from "../lib/query/user";
import {
  normalizeUser,
  normalizeUserPublic,
  simplifyUser,
} from "../utils/user/user.normalize";

export function router(app: Express) {
  app.use("/api/auth/google", googleRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/users", userRouter);
  app.use("/api/posts", postRouter);
  app.use("/api/comments", commentRouter);
  app.use("/api/me", meRouter);
  app.use("/api/account", accountRouter);
  app.use("/api/chats", chatRouter);
  app.use("/api/messages", messageRouter);
  app.get(
    "/api/search",
    validate(
      z.object({
        query: z.object({
          limit: zLimit,
          offset: zOffset,
          type: z.enum(["post", "user", "all"]).optional(),
          q: z.string().optional(),
          filter: z.enum(["followed", "not_followed"]).optional(),
        }),
      })
    ),
    verifyToken,
    tryCatch(getSearchResults)
  );
  app.post("/api/refresh", verifyRefreshToken, refreshToken);
  app.get("/test/endpoint", async (req, res) => {
    const users = await User.findMany({ select: selectUser });

    const normalizedUsers = await Promise.all(
      users.map((u) => normalizeUser(u, false))
    );

    res.status(200).json(normalizedUsers);
  });
  app.get("/test/endpoint2", async (req, res) => {
    const users = await User.findMany();

    res.status(200).json(users);
  });
  app.get("/test/endpoint4", async (req, res) => {
    const users = await User.findMany();

    const normalizedUsers = await Promise.all(
      users.map((u) => normalizeUserPublic(u as any, false))
    );

    res.status(200).json(normalizedUsers);
  });
  app.get("/test/endpoint5", async (req, res) => {
    const users = await User.findMany();

    const normalizedUsers = await Promise.all(
      users.map((u) => simplifyUser(u as any, false))
    );

    res.status(200).json(normalizedUsers);
  });
  app.get("/test/endpoint6", async (req, res) => {
    const users = await User.findMany({ select: selectUser });

    res.status(200).json(users);
  });
  app.get("/test/endpoint3", async (req, res) => {
    res.status(200).json("lol");
  });
}
