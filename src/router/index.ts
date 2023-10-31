import { Express } from "express";
import userRouter from "./userRoutes";
import authRouter from "./authRoutes";
import postRouter from "./postRoutes";
import commentRouter from "./commentRoutes";
import meRouter from "./meRoutes";
import accountRouter from "./accountRoutes";
import chatRouter from "./chatRoutes";
import { refreshToken } from "../controllers/authController";
import { verifyRefreshToken, verifyToken } from "../middlewares/auth";
import { getSearchResults } from "../controllers/searchControllers";
import { tryCatch } from "../middlewares/tryCatch";
import { validateBody } from "../middlewares/validate";
import { z } from "zod";

export function router(app: Express) {
  app.use("/api/auth", authRouter);
  app.use("/api/users", userRouter);
  app.use("/api/posts", postRouter);
  app.use("/api/comments", commentRouter);
  app.use("/api/me", meRouter);
  app.use("/api/account", accountRouter);
  app.use("/api/chats", chatRouter);
  app.get(
    "/api/search",
    validateBody(
      z.object({
        query: z.object({
          type: z.enum(["post", "user", "all"]).optional(),
          q: z.string().optional(),
        }),
      })
    ),
    verifyToken,
    tryCatch(getSearchResults)
  );
  app.post("/api/refresh", verifyRefreshToken, refreshToken);
}
