import { Express } from "express";
import userRouter from "../router/user";
import authRouter from "../router/auth";
import accountRouter from "../router/account";
import postRouter from "../router/post";
import commentRouter from "../router/comment";

export function router(app: Express) {
  app.use("/api/auth", authRouter);
  app.use("/api/user", userRouter);
  app.use("/api/account", accountRouter);
  app.use("/api/post", postRouter);
  app.use("/api/comment", commentRouter);
}
