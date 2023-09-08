import { Express } from "express";
import userRouter from "../router/user";
import authRouter from "../router/auth";
import postRouter from "../router/post";
import commentRouter from "../router/comment";
import meRouter from "../router/me";
import accountRouter from "./account";
import chatRouter from "./chat";
import { refreshToken } from "../controllers/authController";
import { apiLimiter } from "../middlewares/rateLimiter";

export function router(app: Express) {
  app.use("/api/auth", authRouter);
  app.use("/api/users", apiLimiter, userRouter);
  app.use("/api/posts", apiLimiter, postRouter);
  app.use("/api/comments", apiLimiter, commentRouter);
  app.use("/api/me", apiLimiter, meRouter);
  app.use("/api/account", accountRouter);
  app.use("/api/chats", apiLimiter, chatRouter);
  app.post("/api/refresh", apiLimiter, refreshToken);
}
