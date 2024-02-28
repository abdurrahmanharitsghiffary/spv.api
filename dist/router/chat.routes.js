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
const middlewares_1 = require("../middlewares");
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
    .get(validatePagingOptionsExt, checkIsParticipated, (0, handler_middlewares_1.tryCatch)(chatRoom_controller_1.getChatRoomParticipantsByRoomId));
router.route("/:roomId/participants/:participantId").get((0, validator_middlewares_1.validate)(zod_1.z.object({
    params: zod_1.z.object({
        roomId: schema_1.zIntOrStringId,
        participantId: schema_1.zIntOrStringId,
    }),
})), checkIsParticipated, (0, handler_middlewares_1.tryCatch)(chatRoom_controller_1.getParticipant));
exports.default = router;
