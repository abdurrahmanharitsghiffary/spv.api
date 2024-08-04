"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const user_routes_1 = __importDefault(require("./user.routes"));
const bugs_routes_1 = __importDefault(require("./bugs.routes"));
const auth_routes_1 = __importDefault(require("./auth.routes"));
const post_routes_1 = __importDefault(require("./post.routes"));
const googleAuth_routes_1 = __importDefault(require("./googleAuth.routes"));
const messages_routes_1 = __importDefault(require("./messages.routes"));
const comment_routes_1 = __importDefault(require("./comment.routes"));
const me_routes_1 = __importDefault(require("./me.routes"));
const account_routes_1 = __importDefault(require("./account.routes"));
const group_routes_1 = __importDefault(require("./group.routes"));
const report_routes_1 = __importDefault(require("./report.routes"));
const chat_routes_1 = __importDefault(require("./chat.routes"));
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middlewares_1 = require("../middlewares/auth.middlewares");
const search_controllers_1 = require("../controllers/search.controllers");
const handler_middlewares_1 = require("../middlewares/handler.middlewares");
const validator_middlewares_1 = require("../middlewares/validator.middlewares");
const zod_1 = require("zod");
const schema_1 = require("../schema");
const count_controller_1 = require("../controllers/count.controller");
const count_schema_1 = require("../schema/count.schema");
function router(app) {
    app.use("/api/auth/google", googleAuth_routes_1.default);
    app.use("/api/auth", auth_routes_1.default);
    app.use("/api/bugs", bugs_routes_1.default);
    app.use("/api/users", user_routes_1.default);
    app.use("/api/posts", post_routes_1.default);
    app.use("/api/comments", comment_routes_1.default);
    app.use("/api/me", me_routes_1.default);
    app.use("/api/account", account_routes_1.default);
    app.use("/api/chats", chat_routes_1.default);
    app.use("/api/messages", messages_routes_1.default);
    app.use("/api/groups", group_routes_1.default);
    app.use("/api/report", report_routes_1.default);
    app.get("/api/counts", (0, validator_middlewares_1.validate)(count_schema_1.getCountsValidation), auth_middlewares_1.verifyToken, count_controller_1.getCounts);
    app.get("/api/hello-world", () => {
        return "Hello world";
    });
    app.get("/api/search", (0, validator_middlewares_1.validate)(zod_1.z.object({
        query: zod_1.z.object({
            limit: schema_1.zLimit,
            offset: schema_1.zOffset,
            type: zod_1.z.enum(["post", "user", "all", "group"]).optional(),
            q: zod_1.z.string().optional(),
            filter: zod_1.z.enum(["followed", "not_followed"]).optional(),
        }),
    })), auth_middlewares_1.verifyToken, (0, handler_middlewares_1.tryCatch)(search_controllers_1.getSearchResults));
    app.post("/api/refresh", auth_middlewares_1.verifyRefreshToken, auth_controller_1.refreshToken);
}
exports.router = router;
