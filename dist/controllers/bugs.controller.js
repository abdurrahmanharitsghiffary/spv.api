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
exports.reportBug = exports.updateBug = exports.deleteBug = exports.getAllBugs = void 0;
const bug_model_1 = __importDefault(require("../models/bug.model"));
const paging_1 = require("../utils/paging");
const user_1 = require("../lib/query/user");
const user_normalize_1 = require("../utils/user/user.normalize");
const response_1 = require("../utils/response");
const image_models_1 = __importDefault(require("../models/image.models"));
const selectBug = {
    createdAt: true,
    description: true,
    id: true,
    images: { select: { src: true, id: true } },
    isResolved: true,
    updatedAt: true,
    user: { select: user_1.selectUserSimplified },
};
const normalizeBug = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    return Promise.resolve({
        createdAt: payload.createdAt,
        description: payload.description,
        id: payload.id,
        images: payload.images,
        isResolved: payload.isResolved,
        reporter: yield (0, user_normalize_1.simplifyUserWF)(payload.user),
        updatedAt: payload.updatedAt,
    });
});
const getAllBugs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit, offset } = (0, paging_1.parsePaging)(req);
    const bugs = yield bug_model_1.default.findMany({
        take: limit,
        skip: offset,
        orderBy: [{ createdAt: "desc" }, { isResolved: "asc" }],
        select: selectBug,
    });
    const data = yield Promise.all(bugs.map((bug) => Promise.resolve(normalizeBug(bug))));
    const total = yield bug_model_1.default.count();
    return res
        .status(200)
        .json(yield (0, paging_1.getPagingObject)({ data, total_records: total, req }));
});
exports.getAllBugs = getAllBugs;
const deleteBug = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { bugId } = req.params;
    const bId = Number(bugId);
    yield bug_model_1.default.delete({ where: { id: bId } });
    return res.status(204).json(new response_1.ApiResponse(null, 204));
});
exports.deleteBug = deleteBug;
const updateBug = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { isResolved, description } = req.body;
    const { bugId } = req.params;
    const bId = Number(bugId);
    yield bug_model_1.default.update({
        where: { id: bId },
        data: {
            isResolved,
            description,
        },
    });
    return res.status(204).json(new response_1.ApiResponse(null, 204));
});
exports.updateBug = updateBug;
const reportBug = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { description } = req.body;
    const { userId, uploadedImageUrls } = req;
    const uId = Number(userId);
    const bug = yield bug_model_1.default.create({
        data: { description, userId: uId },
        select: selectBug,
    });
    if (bug && uploadedImageUrls && (uploadedImageUrls !== null && uploadedImageUrls !== void 0 ? uploadedImageUrls : []).length > 0) {
        yield image_models_1.default.createMany({
            data: uploadedImageUrls.map((src) => ({ bugId: bug.id, src })),
        });
    }
    const normalizedBugRes = yield normalizeBug(bug);
    return res.status(201).json(new response_1.ApiResponse(normalizedBugRes, 201));
});
exports.reportBug = reportBug;
