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
exports.getReport = exports.deleteReport = exports.madeReport = void 0;
const report_model_1 = __importDefault(require("../models/report.model"));
const response_1 = require("../utils/response");
const image_models_1 = __importDefault(require("../models/image.models"));
const paging_1 = require("../utils/paging");
const user_1 = require("../lib/query/user");
const chat_1 = require("../lib/query/chat");
const user_normalize_1 = require("../utils/user/user.normalize");
const chatRoom_normalize_1 = require("../utils/chat/chatRoom.normalize");
const post_normalize_1 = require("../utils/post/post.normalize");
const post_1 = require("../lib/query/post");
const selectReport = {
    id: true,
    comment: {
        select: {
            postId: true,
            comment: true,
            id: true,
            image: true,
            user: { select: user_1.selectUserSimplified },
            createdAt: true,
            updatedAt: true,
            _count: { select: { likes: true } },
        },
    },
    group: { select: chat_1.selectChatRoomSimplified },
    message: {
        select: {
            chatRoom: { select: { isGroupChat: true } },
            chatRoomId: true,
            author: { select: user_1.selectUserSimplified },
            id: true,
            message: true,
            createdAt: true,
            updatedAt: true,
            chatImage: { select: { id: true, src: true } },
        },
    },
    images: { select: { id: true, src: true } },
    reportedUser: { select: user_1.selectUserSimplified },
    post: {
        select: post_1.selectPost,
    },
    reporter: { select: user_1.selectUserSimplified },
    createdAt: true,
    updatedAt: true,
    report: true,
    type: true,
};
const normalizeReport = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const base = {
        createdAt: payload.createdAt,
        images: payload.images,
        id: payload.id,
        report: payload.report,
        updatedAt: payload.updatedAt,
        type: payload.type,
    };
    switch (base.type) {
        case "user": {
            base.user = yield (0, user_normalize_1.simplifyUser)(payload.reportedUser);
            break;
        }
        case "comment": {
            const p = payload.comment;
            base.comment = {
                comment: p === null || p === void 0 ? void 0 : p.comment,
                id: p === null || p === void 0 ? void 0 : p.id,
                createdAt: p === null || p === void 0 ? void 0 : p.createdAt,
                image: p === null || p === void 0 ? void 0 : p.image,
                updatedAt: p === null || p === void 0 ? void 0 : p.updatedAt,
                user: p === null || p === void 0 ? void 0 : p.user,
                postId: p === null || p === void 0 ? void 0 : p.postId,
                totalLikes: p === null || p === void 0 ? void 0 : p._count.likes,
            };
            break;
        }
        case "group": {
            base.group = yield (0, chatRoom_normalize_1.normalizeChatRoomSimplified)(payload.group);
            break;
        }
        case "message": {
            const p = payload.message;
            base.message = {
                attachments: p.chatImage,
                author: yield (0, user_normalize_1.simplifyUser)(p.author),
                createdAt: p.createdAt,
                id: p.id,
                isGroupChat: p.chatRoom.isGroupChat,
                message: p.message,
                roomId: p.chatRoomId,
                updatedAt: p.updatedAt,
            };
            break;
        }
        case "post": {
            base.post = yield (0, post_normalize_1.normalizePost)(payload.post);
        }
    }
    return base;
});
const madeReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { report, type, id } = req.body;
    const { userId, uploadedImageUrls } = req;
    const uId = Number(userId);
    const createdReport = yield report_model_1.default.create({
        data: { report, type, [type + "Id"]: Number(id), reporterId: uId },
    });
    if (uploadedImageUrls && createdReport) {
        yield image_models_1.default.createMany({
            data: uploadedImageUrls.map((src) => ({
                src: src,
                reportId: createdReport.id,
            })),
        });
    }
    return res.status(201).json(new response_1.ApiResponse(createdReport, 201));
});
exports.madeReport = madeReport;
const deleteReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { reportId } = req.params;
    const rId = Number(reportId);
    yield report_model_1.default.delete({ where: { id: rId } });
    return res.status(204).json(new response_1.ApiResponse(null, 204));
});
exports.deleteReport = deleteReport;
const getReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { type } = req.query;
    const { limit, offset } = (0, paging_1.parsePaging)(req);
    const reports = yield report_model_1.default.findMany({
        where: { type: type === "all" ? undefined : type },
        take: limit,
        skip: offset,
        orderBy: [{ createdAt: "desc" }, { type: "asc" }],
        select: selectReport,
    });
    const normalizedReports = yield Promise.all(reports.map((r) => Promise.resolve(normalizeReport(r))));
    const total = yield report_model_1.default.count({
        where: { type: type === "all" ? undefined : type },
    });
    return res.status(200).json(yield (0, paging_1.getPagingObject)({
        req,
        data: normalizedReports,
        total_records: total,
    }));
});
exports.getReport = getReport;
