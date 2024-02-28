"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middlewares_1 = require("../middlewares/auth.middlewares");
const multer_middlewares_1 = require("../middlewares/multer.middlewares");
const cloudinary_middleware_1 = require("../middlewares/cloudinary.middleware");
const validator_middlewares_1 = require("../middlewares/validator.middlewares");
const zod_form_data_1 = require("zod-form-data");
const zod_1 = require("zod");
const chat_schema_1 = require("../schema/chat.schema");
const groupChat_controllers_1 = require("../controllers/groupChat.controllers");
const handler_middlewares_1 = require("../middlewares/handler.middlewares");
const schema_1 = require("../schema");
const chatRoom_middlewares_1 = require("../middlewares/chatRoom.middlewares");
const middlewares_1 = require("../middlewares");
const router = express_1.default.Router();
const validateIds = (0, validator_middlewares_1.validateBody)(zod_1.z.object({ ids: (0, schema_1.zUniqueInts)("ids") }));
router.use(auth_middlewares_1.verifyToken);
router.route("/").post(multer_middlewares_1.uploadImageV2.single("image"), cloudinary_middleware_1.uploadFilesToCloudinary, (0, validator_middlewares_1.validateBody)(zod_form_data_1.zfd.formData(zod_1.z.object({
    participants: (0, chat_schema_1.zfdParticipants)("participants", 2),
    title: zod_form_data_1.zfd.text(zod_1.z.string().optional()),
    description: zod_form_data_1.zfd.text(zod_1.z.string().optional()),
    applyType: zod_form_data_1.zfd.text(zod_1.z.enum(["public", "private"])).optional(),
    groupVisibility: zod_form_data_1.zfd.text(zod_1.z.enum(["public", "private"])).optional(),
}))), (0, handler_middlewares_1.tryCatch)(groupChat_controllers_1.createGroupChat));
router
    .route("/:groupId")
    .patch(multer_middlewares_1.uploadImageV2.single("image"), cloudinary_middleware_1.uploadFilesToCloudinary, (0, validator_middlewares_1.validate)(zod_1.z.object({
    body: zod_form_data_1.zfd.formData(zod_1.z.object({
        description: schema_1.zfdText.optional(),
        title: zod_form_data_1.zfd.text(zod_1.z.string().max(125).optional()),
        applyType: zod_form_data_1.zfd.text(zod_1.z.enum(["public", "private"])).optional(),
        groupVisibility: zod_form_data_1.zfd.text(zod_1.z.enum(["public", "private"])).optional(),
    })),
    params: zod_1.z.object({
        groupId: schema_1.zIntOrStringId,
    }),
})), (0, chatRoom_middlewares_1.protectChatRoom)("groupId", true), (0, handler_middlewares_1.tryCatch)(groupChat_controllers_1.updateGroupChat))
    .delete((0, validator_middlewares_1.validateParamsV2)("groupId"), (0, chatRoom_middlewares_1.protectChatRoom)("groupId", true, true), (0, handler_middlewares_1.tryCatch)(groupChat_controllers_1.deleteGroupChat));
router
    .route("/:groupId/participants")
    .post((0, validator_middlewares_1.validateParamsV2)("groupId"), validateIds, (0, chatRoom_middlewares_1.protectChatRoom)("groupId", true), (0, handler_middlewares_1.tryCatch)(groupChat_controllers_1.addGroupParticipants))
    .patch((0, validator_middlewares_1.validate)(zod_1.z.object({
    body: zod_1.z.object({
        participants: (0, chat_schema_1.zParticipants)("participants", 1),
    }),
    params: zod_1.z.object({
        groupId: schema_1.zIntOrStringId,
    }),
})), (0, chatRoom_middlewares_1.protectChatRoom)("groupId", true), (0, handler_middlewares_1.tryCatch)(groupChat_controllers_1.updateGroupChatParticipants))
    .delete((0, validator_middlewares_1.validate)(zod_1.z.object({
    body: zod_1.z.object({
        ids: (0, schema_1.zUniqueInts)("ids"),
    }),
    params: zod_1.z.object({
        groupId: schema_1.zIntOrStringId,
    }),
})), (0, chatRoom_middlewares_1.protectChatRoom)("groupId", true), (0, handler_middlewares_1.tryCatch)(groupChat_controllers_1.deleteGroupParticipants));
router
    .route("/:groupId/join")
    .post((0, validator_middlewares_1.validateParamsV2)("groupId"), (0, handler_middlewares_1.tryCatch)(groupChat_controllers_1.joinGroupChat));
router
    .route("/:groupId/membership-requests")
    .post((0, validator_middlewares_1.validateParamsV2)("groupId"), (0, validator_middlewares_1.validateBody)(zod_1.z.object({ comment: zod_1.z.string().optional() })), (0, handler_middlewares_1.tryCatch)(groupChat_controllers_1.requestGroupChatApplication))
    .get((0, validator_middlewares_1.validateParamsV2)("groupId"), validator_middlewares_1.validatePagingOptions, (0, validator_middlewares_1.validate)(zod_1.z.object({
    query: zod_1.z.object({
        type: zod_1.z.enum(["pending", "approved", "rejected", "all"]).optional(),
    }),
})), (0, middlewares_1.checkIsParticipatedInChatRoom)({
    params: "groupId",
    shouldAlsoBlockUserRole: true,
}), (0, handler_middlewares_1.tryCatch)(groupChat_controllers_1.getGroupChatApplicationRequest));
router
    .route("/:groupId/leave")
    .delete((0, validator_middlewares_1.validateParamsV2)("groupId"), (0, handler_middlewares_1.tryCatch)(groupChat_controllers_1.leaveGroupChat));
router
    .route("/:groupId/membership-requests/:requestId/approve")
    .post((0, validator_middlewares_1.validateParamsV2)("groupId"), (0, validator_middlewares_1.validateParamsV2)("requestId"), (0, chatRoom_middlewares_1.protectChatRoom)("groupId", true), (0, handler_middlewares_1.tryCatch)(groupChat_controllers_1.approveGroupChatApplicationRequest));
router
    .route("/:groupId/membership-requests/:requestId/reject")
    .delete((0, validator_middlewares_1.validateParamsV2)("groupId"), (0, validator_middlewares_1.validateParamsV2)("requestId"), (0, chatRoom_middlewares_1.protectChatRoom)("groupId", true), (0, handler_middlewares_1.tryCatch)(groupChat_controllers_1.rejectGroupChatApplicationRequest));
exports.default = router;
