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
exports.parseParticipantsField = exports.protectChat = void 0;
const error_1 = require("../lib/error");
const chat_models_1 = __importDefault(require("../models/chat.models"));
const protectChat = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req;
    const { messageId } = req.params;
    const chat = yield chat_models_1.default.findUnique({
        where: { id: Number(messageId) },
        select: { authorId: true, id: true },
    });
    if ((chat === null || chat === void 0 ? void 0 : chat.authorId) !== Number(userId))
        throw new error_1.ForbiddenError();
    return next();
});
exports.protectChat = protectChat;
const parseParticipantsField = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    console.log(req.body, "bodyy");
    if (req.body.participants)
        req.body.participants = ((_b = (_a = req.body) === null || _a === void 0 ? void 0 : _a.participants) !== null && _b !== void 0 ? _b : []).map((participant) => {
            console.log(participant[0]);
            return JSON.parse(participant)[0];
        });
    return next();
});
exports.parseParticipantsField = parseParticipantsField;
