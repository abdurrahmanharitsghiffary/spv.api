"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.passportGoogle = void 0;
const passport_google_oauth20_1 = require("passport-google-oauth20");
const passport_1 = __importDefault(require("passport"));
const passportGoogle = () => {
    var _a, _b;
    return passport_1.default.use(new passport_google_oauth20_1.Strategy({
        clientID: (_a = process.env.GOOGLE_CLIENT_ID) !== null && _a !== void 0 ? _a : "",
        clientSecret: (_b = process.env.GOOGLE_CLIENT_SECRET) !== null && _b !== void 0 ? _b : "",
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
        passReqToCallback: true,
    }, function (request, accessToken, refreshToken, profile, done) {
        return done(null, profile);
    }));
};
exports.passportGoogle = passportGoogle;
passport_1.default.serializeUser(function (user, done) {
    done(null, user);
});
passport_1.default.deserializeUser(function (user, done) {
    done(null, user);
});
