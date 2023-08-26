import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import notFound from "./middlewares/notfound";
import { error } from "./middlewares/error";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { router } from "./router";
import { uploadImage } from "./utils/uploadImage";
import { ExpressRequest, ExpressResponse } from "./types/request";
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static("./src"));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));
app.use(cors());

router(app);

app.post(
  "/upload/image",
  uploadImage.single("image"),
  (req: ExpressRequest, res: ExpressResponse) => {
    console.log(req.file);
    console.log(req.file?.path.split("\\").join("/"));
    res.status(200).json(req.file);
  }
);

app.use(notFound);
app.use(error);

app.listen(process.env.PORT, () => {
  console.log(`listening on http://localhost:${process.env.PORT}`);
});
