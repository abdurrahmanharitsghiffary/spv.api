"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.server = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const middlewares_1 = __importDefault(require("./middlewares"));
const error_middlewares_1 = require("./middlewares/error.middlewares");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const router_1 = require("./router");
const helmet_1 = __importDefault(require("helmet"));
const sanitizer_middlewares_1 = require("./middlewares/sanitizer.middlewares");
const passport_1 = __importDefault(require("passport"));
const passport_middlewares_1 = require("./middlewares/passport.middlewares");
const http_1 = require("http");
const consts_1 = require("./lib/consts");
const socket_1 = require("./socket");
const socket_io_1 = require("socket.io");
const allowlist = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://spv-client.vercel.app",
];
const app = (0, express_1.default)();
exports.server = (0, http_1.createServer)(app);
exports.io = new socket_io_1.Server(exports.server, {
    cors: { origin: consts_1.BASE_CLIENT_URL, credentials: true },
});
app.set("io", exports.io);
app.use(express_1.default.json());
app.use(express_1.default.static("./src"));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)(consts_1.COOKIE_SECRET));
app.use((0, cors_1.default)({
    credentials: true,
    origin: (origin, cb) => {
        if (!origin)
            return cb(null, true);
        if (allowlist.indexOf(origin !== null && origin !== void 0 ? origin : "") !== -1) {
            return cb(null, true);
        }
        return cb(new Error("The CORS policy for this site does not allow access from the specified Origin."), false);
    },
}));
(0, passport_middlewares_1.passportGoogle)();
app.use(passport_1.default.initialize());
process.env.NODE_ENV !== "production" && app.use((0, morgan_1.default)("dev"));
app.use((0, sanitizer_middlewares_1.sanitizer)());
app.use((0, helmet_1.default)({
    xFrameOptions: {
        action: "deny",
    },
}));
app.use(helmet_1.default.contentSecurityPolicy({
    directives: {
        defaultSrc: ["self"],
        connectSrc: ["self", "https://accounts.google.com"],
        // Add any other directives you need
    },
}));
(0, socket_1.ioInit)(exports.io);
(0, router_1.router)(app);
app.use(middlewares_1.default);
app.use(error_middlewares_1.error);
exports.default = exports.server;
