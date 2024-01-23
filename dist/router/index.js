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
exports.router = void 0;
const user_routes_1 = __importDefault(require("./user.routes"));
const auth_routes_1 = __importDefault(require("./auth.routes"));
const post_routes_1 = __importDefault(require("./post.routes"));
const googleAuth_routes_1 = __importDefault(require("./googleAuth.routes"));
const messages_routes_1 = __importDefault(require("./messages.routes"));
const comment_routes_1 = __importDefault(require("./comment.routes"));
const me_routes_1 = __importDefault(require("./me.routes"));
const account_routes_1 = __importDefault(require("./account.routes"));
const chat_routes_1 = __importDefault(require("./chat.routes"));
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middlewares_1 = require("../middlewares/auth.middlewares");
const search_controllers_1 = require("../controllers/search.controllers");
const handler_middlewares_1 = require("../middlewares/handler.middlewares");
const validator_middlewares_1 = require("../middlewares/validator.middlewares");
const zod_1 = require("zod");
const schema_1 = require("../schema");
const user_models_1 = __importDefault(require("../models/user.models"));
const user_1 = require("../lib/query/user");
const user_normalize_1 = require("../utils/user/user.normalize");
const paging_1 = require("../utils/paging");
function router(app) {
    app.use("/api/auth/google", googleAuth_routes_1.default);
    app.use("/api/auth", auth_routes_1.default);
    app.use("/api/users", user_routes_1.default);
    app.use("/api/posts", post_routes_1.default);
    app.use("/api/comments", comment_routes_1.default);
    app.use("/api/me", me_routes_1.default);
    app.use("/api/account", account_routes_1.default);
    app.use("/api/chats", chat_routes_1.default);
    app.use("/api/messages", messages_routes_1.default);
    app.get("/api/search", (0, validator_middlewares_1.validate)(zod_1.z.object({
        query: zod_1.z.object({
            limit: schema_1.zLimit,
            offset: schema_1.zOffset,
            type: zod_1.z.enum(["post", "user", "all"]).optional(),
            q: zod_1.z.string().optional(),
            filter: zod_1.z.enum(["followed", "not_followed"]).optional(),
        }),
    })), auth_middlewares_1.verifyToken, (0, handler_middlewares_1.tryCatch)(search_controllers_1.getSearchResults));
    app.post("/api/refresh", auth_middlewares_1.verifyRefreshToken, auth_controller_1.refreshToken);
    // 4500 - 5000ms
    app.get("/test/endpoint", (req, res) => __awaiter(this, void 0, void 0, function* () {
        const users = yield user_models_1.default.findMany({ select: user_1.selectUser });
        const normalizedUsers = yield Promise.all(users.map((u) => (0, user_normalize_1.normalizeUser)(u, false)));
        res.status(200).json(normalizedUsers);
    }));
    // 950 - 1200 ms
    app.get("/test/endpoint2", (req, res) => __awaiter(this, void 0, void 0, function* () {
        const users = yield user_models_1.default.findMany();
        res.status(200).json(users);
    }));
    // 180++ ms
    app.get("/test/endpoint3", (req, res) => __awaiter(this, void 0, void 0, function* () {
        res.status(200).json("lol");
    }));
    // Error because normalizing invalid payload
    app.get("/test/endpoint4", (req, res) => __awaiter(this, void 0, void 0, function* () {
        const users = yield user_models_1.default.findMany();
        const normalizedUsers = yield Promise.all(users.map((u) => (0, user_normalize_1.normalizeUserPublic)(u, false)));
        res.status(200).json(normalizedUsers);
    }));
    // 970 - 1190 ms
    app.get("/test/endpoint5", (req, res) => __awaiter(this, void 0, void 0, function* () {
        const users = yield user_models_1.default.findMany();
        const normalizedUsers = yield Promise.all(users.map((u) => (0, user_normalize_1.simplifyUser)(u, false)));
        res.status(200).json(normalizedUsers);
    }));
    // 4500++ ms
    app.get("/test/endpoint6", (req, res) => __awaiter(this, void 0, void 0, function* () {
        const users = yield user_models_1.default.findMany({ select: user_1.selectUser });
        res.status(200).json(users);
    }));
    // 4500 - 4700 ms
    app.get("/test/ep", validator_middlewares_1.validatePagingOptions, (req, res) => __awaiter(this, void 0, void 0, function* () {
        const { limit = 20, offset = 0 } = (0, paging_1.parsePaging)(req);
        const users = yield user_models_1.default.findMany({
            skip: offset,
            take: limit,
            select: user_1.selectUser,
            orderBy: {
                createdAt: "desc",
            },
        });
        return res
            .status(200)
            .json(yield (0, paging_1.getPagingObject)({ data: users, total_records: users.length, req }));
    }));
    // 980 - 1150 ms
    app.get("/test/ep2", validator_middlewares_1.validatePagingOptions, (req, res) => __awaiter(this, void 0, void 0, function* () {
        const { limit = 20, offset = 0 } = (0, paging_1.parsePaging)(req);
        const users = yield user_models_1.default.findMany({
            skip: offset,
            take: limit,
            orderBy: {
                createdAt: "desc",
            },
        });
        return res
            .status(200)
            .json(yield (0, paging_1.getPagingObject)({ data: users, total_records: users.length, req }));
    }));
    // 4450 - 4650 ms
    app.get("/test/ep3", validator_middlewares_1.validatePagingOptions, (req, res) => __awaiter(this, void 0, void 0, function* () {
        const { limit = 20, offset = 0 } = (0, paging_1.parsePaging)(req);
        const users = yield user_models_1.default.findMany({
            skip: offset,
            take: limit,
            select: user_1.selectUser,
            orderBy: {
                createdAt: "desc",
            },
        });
        const normalizedUsers = yield Promise.all(users.map((u) => Promise.resolve((0, user_normalize_1.normalizeUserPublic)(u, false))));
        return res.status(200).json(yield (0, paging_1.getPagingObject)({
            data: normalizedUsers,
            total_records: users.length,
            req,
        }));
    }));
    app.get("/test/us", (req, res) => __awaiter(this, void 0, void 0, function* () {
        const users = yield user_models_1.default.findMany({
            select: user_1.selectUserSimplified,
        });
        const normalized = yield Promise.all(users.map((u) => (0, user_normalize_1.simplifyUser)(u, false)));
        return res.status(200).json(normalized);
    }));
}
exports.router = router;
// The main problem why the query is really slow is because inneficient selectUserQuery??
