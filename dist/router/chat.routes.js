"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middlewares_1 = require("../middlewares/auth.middlewares");
const handler_middlewares_1 = require("../middlewares/handler.middlewares");
const validator_middlewares_1 = require("../middlewares/validator.middlewares");
const zod_1 = require("zod");
const schema_1 = require("../schema");
const chatRoom_controller_1 = require("../controllers/chatRoom.controller");
const chatRoom_middlewares_1 = require("../middlewares/chatRoom.middlewares");
const groupChat_controllers_1 = require("../controllers/groupChat.controllers");
const multer_middlewares_1 = require("../middlewares/multer.middlewares");
const zod_form_data_1 = require("zod-form-data");
const chat_schema_1 = require("../schema/chat.schema");
const middlewares_1 = require("../middlewares");
const cloudinary_middleware_1 = require("../middlewares/cloudinary.middleware");
const router = express_1.default.Router();
router.use(auth_middlewares_1.verifyToken);
const checkIsParticipated = (0, middlewares_1.checkIsParticipatedInChatRoom)({ params: "roomId" });
const validatePagingOptionsExt = (0, validator_middlewares_1.validate)(zod_1.z.object({
    params: zod_1.z.object({ roomId: schema_1.zIntOrStringId }),
    query: zod_1.z.object({ limit: schema_1.zLimit, offset: schema_1.zOffset }),
}));
router
    .route("/")
    .post((0, validator_middlewares_1.validateBody)(zod_1.z.object({ participantId: (0, schema_1.zIntId)("participantId") })), (0, handler_middlewares_1.tryCatch)(chatRoom_controller_1.createChatRoom));
router
    .route("/:roomId")
    .get((0, validator_middlewares_1.validateParamsV2)("roomId"), checkIsParticipated, (0, handler_middlewares_1.tryCatch)(chatRoom_controller_1.getChatRoomById));
router
    .route("/:roomId/messages")
    .get(validatePagingOptionsExt, checkIsParticipated, (0, handler_middlewares_1.tryCatch)(chatRoom_controller_1.getChatRoomMessagesByRoomId));
router
    .route("/:roomId/participants")
    .get(validatePagingOptionsExt, checkIsParticipated, (0, handler_middlewares_1.tryCatch)(chatRoom_controller_1.getChatRoomParticipantsByRoomId))
    .patch((0, validator_middlewares_1.validate)(zod_1.z.object({
    body: zod_1.z.object({
        participants: (0, chat_schema_1.zParticipants)("participants", 1),
    }),
    params: zod_1.z.object({
        roomId: schema_1.zIntOrStringId,
    }),
})), (0, chatRoom_middlewares_1.protectChatRoom)("roomId", true), (0, handler_middlewares_1.tryCatch)(groupChat_controllers_1.updateGroupChatParticipants))
    .delete((0, validator_middlewares_1.validate)(zod_1.z.object({
    body: zod_1.z.object({
        ids: zod_1.z.array(zod_1.z.number()),
    }),
    params: zod_1.z.object({
        roomId: schema_1.zIntOrStringId,
    }),
})), (0, chatRoom_middlewares_1.protectChatRoom)("roomId", true), (0, handler_middlewares_1.tryCatch)(groupChat_controllers_1.deleteGroupParticipants));
router.route("/:roomId/participants/:participantId").get((0, validator_middlewares_1.validate)(zod_1.z.object({
    params: zod_1.z.object({
        roomId: schema_1.zIntOrStringId,
        participantId: schema_1.zIntOrStringId,
    }),
})), (0, handler_middlewares_1.tryCatch)(chatRoom_controller_1.getParticipant));
router.route("/group").post(multer_middlewares_1.uploadImageV2.single("image"), cloudinary_middleware_1.uploadFilesToCloudinary, (0, validator_middlewares_1.validateBody)(zod_form_data_1.zfd.formData(zod_1.z.object({
    participants: (0, chat_schema_1.zfdParticipants)("participants", 2),
    title: zod_form_data_1.zfd.text(zod_1.z.string().optional()),
    description: zod_form_data_1.zfd.text(zod_1.z.string().optional()),
}))), (0, handler_middlewares_1.tryCatch)(groupChat_controllers_1.createGroupChat));
router
    .route("/group/:groupId")
    .patch(multer_middlewares_1.uploadImageV2.single("image"), cloudinary_middleware_1.uploadFilesToCloudinary, (0, validator_middlewares_1.validate)(zod_1.z.object({
    body: zod_form_data_1.zfd.formData(zod_1.z.object({
        participants: (0, chat_schema_1.zfdParticipants)("participants").optional(),
        description: schema_1.zfdText.optional(),
        title: zod_form_data_1.zfd.text(zod_1.z.string().max(125).optional()),
    })),
    params: zod_1.z.object({
        groupId: schema_1.zIntOrStringId,
    }),
})), (0, chatRoom_middlewares_1.protectChatRoom)("groupId", true), (0, handler_middlewares_1.tryCatch)(groupChat_controllers_1.updateGroupChat))
    .delete((0, validator_middlewares_1.validateParamsV2)("groupId"), (0, chatRoom_middlewares_1.protectChatRoom)("groupId", true, true), (0, handler_middlewares_1.tryCatch)(groupChat_controllers_1.deleteGroupChat));
router
    .route("/group/:groupId/join")
    .post((0, validator_middlewares_1.validateParamsV2)("groupId"), (0, handler_middlewares_1.tryCatch)(groupChat_controllers_1.joinGroupChat));
router
    .route("/group/:groupId/leave")
    .delete((0, validator_middlewares_1.validateParamsV2)("groupId"), (0, handler_middlewares_1.tryCatch)(groupChat_controllers_1.leaveGroupChat));
exports.default = router;
