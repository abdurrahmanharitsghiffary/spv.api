import { Express } from "express";
import userRouter from "./user.routes";
import authRouter from "./auth.routes";
import postRouter from "./post.routes";
import googleRouter from "./googleAuth.routes";
import messageRouter from "./messages.routes";
import commentRouter from "./comment.routes";
import meRouter from "./me.routes";
import accountRouter from "./account.routes";
import groupRouter from "./group.routes";
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
import { getCounts } from "../controllers/count.controller";
import { getCountsValidation } from "../schema/count.schema";

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
  app.use("/api/groups", groupRouter);
  app.get("/api/counts", validate(getCountsValidation), verifyToken, getCounts);
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
}
