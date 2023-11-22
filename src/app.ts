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
import passport from "passport";
import { passportGoogle } from "./lib/googleAuth";
dotenv.config();

const allowlist = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://spv-client.vercel.app",
];

const app = express();
app.use(express.json());
app.use(express.static("./src"));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.urlencoded({ extended: false }));
passportGoogle();
app.use(passport.initialize());
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
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["self"],
      connectSrc: ["self", "https://accounts.google.com"],
      // Add any other directives you need
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
