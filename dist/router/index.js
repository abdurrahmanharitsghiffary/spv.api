"use strict";
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
const multer_middlewares_1 = require("../middlewares/multer.middlewares");
const cloudinary_middleware_1 = require("../middlewares/cloudinary.middleware");
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
    // // 4500 - 5000ms
    // app.get("/test/endpoint", async (req, res) => {
    //   const users = await User.findMany({ select: selectUser });
    //   const normalizedUsers = await Promise.all(
    //     users.map((u) => normalizeUser(u))
    //   );
    //   res.status(200).json(normalizedUsers);
    // });
    // // 950 - 1200 ms
    // app.get("/test/endpoint2", async (req, res) => {
    //   const users = await User.findMany();
    //   res.status(200).json(users);
    // });
    // // 180++ ms
    // app.get("/test/endpoint3", async (req, res) => {
    //   res.status(200).json("lol");
    // });
    // // Error because normalizing invalid payload
    // app.get("/test/endpoint4", async (req, res) => {
    //   const users = await User.findMany();
    //   const normalizedUsers = await Promise.all(
    //     users.map((u) => normalizeUserPublic(u as any))
    //   );
    //   res.status(200).json(normalizedUsers);
    // });
    // // 970 - 1190 ms
    // app.get("/test/endpoint5", async (req, res) => {
    //   const users = await User.findMany();
    //   const normalizedUsers = await Promise.all(
    //     users.map((u) => simplifyUser(u as any))
    //   );
    //   res.status(200).json(normalizedUsers);
    // });
    // // 4500++ ms
    // app.get("/test/endpoint6", async (req, res) => {
    //   const users = await User.findMany({ select: selectUser });
    //   res.status(200).json(users);
    // });
    // // 4500 - 4700 ms
    // app.get("/test/ep", validatePagingOptions, async (req, res) => {
    //   const { limit = 20, offset = 0 } = parsePaging(req);
    //   const users = await User.findMany({
    //     skip: offset,
    //     take: limit,
    //     select: selectUser,
    //     orderBy: {
    //       createdAt: "desc",
    //     },
    //   });
    //   return res
    //     .status(200)
    //     .json(
    //       await getPagingObject({ data: users, total_records: users.length, req })
    //     );
    // });
    // // 980 - 1150 ms
    // app.get("/test/ep2", validatePagingOptions, async (req, res) => {
    //   const { limit = 20, offset = 0 } = parsePaging(req);
    //   const users = await User.findMany({
    //     skip: offset,
    //     take: limit,
    //     orderBy: {
    //       createdAt: "desc",
    //     },
    //   });
    //   return res
    //     .status(200)
    //     .json(
    //       await getPagingObject({ data: users, total_records: users.length, req })
    //     );
    // });
    // // 4450 - 4650 ms
    // app.get("/test/ep3", validatePagingOptions, async (req, res) => {
    //   const { limit = 20, offset = 0 } = parsePaging(req);
    //   const users = await User.findMany({
    //     skip: offset,
    //     take: limit,
    //     select: selectUser,
    //     orderBy: {
    //       createdAt: "desc",
    //     },
    //   });
    //   const normalizedUsers = await Promise.all(
    //     users.map((u) => Promise.resolve(normalizeUserPublic(u)))
    //   );
    //   return res.status(200).json(
    //     await getPagingObject({
    //       data: normalizedUsers,
    //       total_records: users.length,
    //       req,
    //     })
    //   );
    // });
    // app.get("/test/us", async (req, res) => {
    //   const users = await User.findMany({
    //     select: selectUserSimplified,
    //   });
    //   const normalized = await Promise.all(users.map((u) => simplifyUser(u)));
    //   return res.status(200).json(normalized);
    // });
    app.post("/test/postimage", multer_middlewares_1.uploadImageV2.array("image"), cloudinary_middleware_1.uploadFilesToCloudinary, (req, res) => {
        return res.status(200).json("success");
    });
}
exports.router = router;
// The main problem why the query is really slow is because inneficient selectUserQuery??
