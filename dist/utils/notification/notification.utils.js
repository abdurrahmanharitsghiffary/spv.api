"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notify = void 0;
const notification_models_1 = __importDefault(require("../../models/notification.models"));
const notification_1 = require("../../lib/query/notification");
const notification_normalize_1 = require("./notification.normalize");
const socket_utils_1 = require("../../socket/socket.utils");
const consts_1 = require("../../lib/consts");
const event_1 = require("../../socket/event");
const notify = (req, data) => __awaiter(void 0, void 0, void 0, function* () {
    if (data.receiverId === data.userId)
        return null;
    const createdNotification = yield notification_models_1.default.create({
        data: Object.assign({}, data),
        select: Object.assign({}, notification_1.selectNotificationSimplified),
    });
    console.log(createdNotification, "Created Notification");
    const normalizedNotification = yield (0, notification_normalize_1.normalizeNotification)(createdNotification);
    (0, socket_utils_1.emitSocketEvent)(req, (0, consts_1.Socket_Id)(normalizedNotification.receiverId, "USER"), event_1.Socket_Event.NOTIFY, normalizedNotification);
    return normalizedNotification;
});
exports.notify = notify;
