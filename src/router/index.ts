import { Express } from "express";
import userRouter from "../router/user";
import authRouter from "../router/auth";
import postRouter from "../router/post";
import commentRouter from "../router/comment";
import meRouter from "../router/me";
import accountRouter from "./account";
import chatRouter from "./chat";
import { refreshToken } from "../controllers/authController";

export function router(app: Express) {
  app.use("/api/auth", authRouter);
  app.use("/api/users", userRouter);
  app.use("/api/posts", postRouter);
  app.use("/api/comments", commentRouter);
  app.use("/api/me", meRouter);
  app.use("/api/account", accountRouter);
  app.use("/api/chats", chatRouter);
  app.post("/api/refresh", refreshToken);
}
