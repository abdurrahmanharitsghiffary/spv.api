import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import notFound from "./middlewares/notfound";
import { error } from "./middlewares/error";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { router } from "./router";
import helmet from "helmet";
import { apiLimiter } from "./middlewares/rateLimiter";
import { sanitize } from "./middlewares/sanitizeHtml";
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static("./src"));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));
app.use(sanitize());
app.use(
  helmet({
    xFrameOptions: {
      action: "deny",
    },
  })
);
app.use(cors());

router(app);

app.use(notFound);
app.use(error);

export default app;
