import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import notFound from "./middlewares/notfound";
import { error } from "./middlewares/error";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { router } from "./router";
import helmet from "helmet";
import { sanitizer } from "./middlewares/sanitizer";
dotenv.config();

const allowlist = ["http://localhost:3000", "http://127.0.0.1:3000"];

const app = express();
app.use(express.json());
app.use(express.static("./src"));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));
app.use(sanitizer());
app.use(
  helmet({
    xFrameOptions: {
      action: "deny",
    },
  })
);
app.use(
  cors({
    credentials: true,
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowlist.indexOf(origin ?? "") !== -1) {
        return cb(null, true);
      }
      return cb(
        new Error(
          "The CORS policy for this site does not allow access from the specified Origin."
        ),
        false
      );
    },
  })
);

router(app);

app.use(notFound);
app.use(error);

export default app;
