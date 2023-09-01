import { Express } from "express";
import userRouter from "../router/user";
import authRouter from "../router/auth";
import postRouter from "../router/post";
import commentRouter from "../router/comment";
import meRouter from "../router/me";
import { refreshToken } from "../controllers/authController";

export function router(app: Express) {
  app.use("/api/auth", authRouter);
  app.use("/api/users", userRouter);
  app.use("/api/posts", postRouter);
  app.use("/api/comments", commentRouter);
  app.use("/api/me", meRouter);
  app.post("/api/refresh", refreshToken);
}
