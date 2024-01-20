"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middlewares_1 = require("../middlewares/auth.middlewares");
const multer_middlewares_1 = require("../middlewares/multer.middlewares");
const chat_controller_1 = require("../controllers/chat.controller");
const handler_middlewares_1 = require("../middlewares/handler.middlewares");
const chat_middlewares_1 = require("../middlewares/chat.middlewares");
const validator_middlewares_1 = require("../middlewares/validator.middlewares");
const zod_form_data_1 = require("zod-form-data");
const zod_1 = require("zod");
const chat_schema_1 = require("../schema/chat.schema");
const schema_1 = require("../schema");
const middlewares_1 = require("../middlewares");
const router = express_1.default.Router();
router.use(auth_middlewares_1.verifyToken);
router.route("/").post(multer_middlewares_1.uploadImage.array("images[]"), (0, validator_middlewares_1.validateBody)(zod_form_data_1.zfd.formData(zod_1.z.object({
    message: chat_schema_1.zfdChatMessage,
    chatRoomId: (0, schema_1.zfdInt)("chatRoomId"),
}))), (0, middlewares_1.checkIsParticipatedInChatRoom)({
    body: "chatRoomId",
    shouldAlsoBlockSendingMessageToGroupChat: true,
}), (0, handler_middlewares_1.tryCatch)(chat_controller_1.createChat));
router
    .route("/:messageId")
    .get((0, validator_middlewares_1.validateParamsV2)("messageId"), middlewares_1.checkMessageAccess, (0, handler_middlewares_1.tryCatch)(chat_controller_1.getMessagesById))
    .delete((0, validator_middlewares_1.validateParamsV2)("messageId"), (0, handler_middlewares_1.tryCatchMiddleware)(chat_middlewares_1.protectChat), (0, handler_middlewares_1.tryCatch)(chat_controller_1.deleteChatById))
    .patch((0, validator_middlewares_1.validate)(zod_1.z.object({
    body: zod_1.z.object({
        message: chat_schema_1.zChatMessage,
    }),
    params: zod_1.z.object({
        messageId: schema_1.zIntOrStringId,
    }),
})), (0, handler_middlewares_1.tryCatchMiddleware)(chat_middlewares_1.protectChat), (0, handler_middlewares_1.tryCatch)(chat_controller_1.updateChatById));
exports.default = router;
