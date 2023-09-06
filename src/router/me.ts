import express from "express";
import {
  deleteAccountImage,
  deleteMyAccount,
  getMyAccountInfo,
  updateMyAccount,
  updateProfileImage,
} from "../controllers/accountController";
import { tryCatch } from "../middlewares/tryCatch";
import { verifyToken } from "../middlewares/auth";
import { getAllMyPosts } from "../controllers/postController";
import {
  getFollowedUser,
  getMyFollowers,
  createFollowUser,
  deleteFollow,
} from "../controllers/followController";
import { uploadImage } from "../utils/uploadImage";
import { getAllChatsByUserId } from "../controllers/chatController";

const router = express.Router();

router.use(verifyToken);

router
  .route("/account")
  .get(tryCatch(getMyAccountInfo))
  .patch(tryCatch(updateMyAccount))
  .delete(tryCatch(deleteMyAccount));
router
  .route("/account/images")
  .delete(tryCatch(deleteAccountImage))
  .patch(uploadImage.single("image"), tryCatch(updateProfileImage));
router.route("/chats").get(tryCatch(getAllChatsByUserId));
router.route("/posts").get(tryCatch(getAllMyPosts));
router.route("/follow").post(tryCatch(createFollowUser));
router.route("/following").get(tryCatch(getFollowedUser));
router.route("/followers").get(tryCatch(getMyFollowers));
router.route("/follow/:followId").delete(tryCatch(deleteFollow));

export default router;
