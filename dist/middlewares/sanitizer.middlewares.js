"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizer = void 0;
const sanitize_html_1 = __importDefault(require("sanitize-html"));
const clean = (data) => {
    data = JSON.stringify(data);
    data = (0, sanitize_html_1.default)(data, { disallowedTagsMode: "escape" });
    data = JSON.parse(data);
    return data;
};
const sanitizer = () => {
    return (req, res, next) => {
        if (Object.keys(req.body).length > 0 && req.body.constructor === Object) {
            req.body = clean(req.body);
        }
        if (Object.keys(req.query).length > 0 && req.query.constructor === Object) {
            req.query = clean(req.query);
        }
        if (Object.keys(req.params).length > 0 &&
            req.params.constructor === Object) {
            req.params = clean(req.params);
        }
        next();
    };
};
exports.sanitizer = sanitizer;
