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
    app.get("/test/endpoint", (req, res) => __awaiter(this, void 0, void 0, function* () {
        const users = yield user_models_1.default.findMany({ select: user_1.selectUser });
        const normalizedUsers = yield Promise.all(users.map((u) => (0, user_normalize_1.normalizeUser)(u, false)));
        res.status(200).json(normalizedUsers);
    }));
}
exports.router = router;
