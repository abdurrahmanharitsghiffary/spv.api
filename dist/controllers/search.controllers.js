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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSearchResults = void 0;
const user_utils_1 = require("../utils/user/user.utils");
const paging_1 = require("../utils/paging");
const post_utils_1 = require("../utils/post/post.utils");
const chatRoom_utils_1 = require("../utils/chat/chatRoom.utils");
// const searchType: string[] = ["user", "post", "all"];
const getSearchResults = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { userId } = req;
    let { type = "all", q = "", limit = 20, offset = 0, filter } = req.query;
    offset = Number(offset);
    limit = Number(limit);
    let searchResults = {};
    const isTypeAllOr = (key) => type === "all" || type === key;
    let userResults;
    let postResults;
    let groupResults;
    if (isTypeAllOr("user")) {
        userResults = yield (0, user_utils_1.searchUsersByName)({
            query: q,
            limit,
            offset,
            currentUserId: Number(userId),
            filter: filter,
        });
    }
    if (isTypeAllOr("group")) {
        groupResults = yield (0, chatRoom_utils_1.searchGroups)({
            limit,
            offset,
            query: q,
        });
    }
    if (isTypeAllOr("post")) {
        postResults = yield (0, post_utils_1.searchPosts)({
            limit,
            offset,
            query: q,
            currentUserId: Number(userId),
        });
    }
    if (type === "user") {
        searchResults = userResults;
    }
    else if (type === "post") {
        searchResults = postResults;
    }
    else if (type === "group") {
        searchResults = groupResults;
    }
    else if (type === "all") {
        searchResults.users = userResults;
        searchResults.posts = postResults;
        searchResults.groups = groupResults;
        return res.status(200).json(yield (0, paging_1.getPagingObject)({
            data: searchResults,
            req,
            total_records: Object.values(searchResults).reduce((e, n) => e + n.total, 0),
        }));
    }
    return res.status(200).json(yield (0, paging_1.getPagingObject)({
        data: (_a = searchResults === null || searchResults === void 0 ? void 0 : searchResults.data) !== null && _a !== void 0 ? _a : [],
        total_records: (_b = searchResults === null || searchResults === void 0 ? void 0 : searchResults.total) !== null && _b !== void 0 ? _b : 0,
        req,
    }));
});
exports.getSearchResults = getSearchResults;
