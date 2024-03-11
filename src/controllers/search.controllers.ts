import express from "express";
// import { RequestError } from "../lib/error";
import { Post } from "../types/post";
import { SearchFilter, UserAccountPublic } from "../types/user";
import { searchUsersByName } from "../utils/user/user.utils";
import { getPagingObject } from "../utils/paging";
import { searchPosts } from "../utils/post/post.utils";
import { ExpressRequestExtended } from "../types/request";
import { ChatRoomSimplified } from "../types/chat";
import { searchGroups } from "../utils/chat/chatRoom.utils";

export type PaginationData<T> = { data: T; total: number };
export type SearchAllData = {
  posts: PaginationData<Post[]>;
  users: PaginationData<UserAccountPublic[]>;
  groups: PaginationData<ChatRoomSimplified[]>;
};
// const searchType: string[] = ["user", "post", "all"];

export const getSearchResults = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req as ExpressRequestExtended;
  let { type = "all", q = "", limit = 20, offset = 0, filter } = req.query;

  offset = Number(offset);
  limit = Number(limit);
  let searchResults:
    | PaginationData<Post[]>
    | PaginationData<UserAccountPublic[]>
    | PaginationData<ChatRoomSimplified[]>
    | SearchAllData
    | {} = {};

  const isTypeAllOr = (key: string) => type === "all" || type === key;

  let userResults: any;
  let postResults: any;
  let groupResults: any;

  if (isTypeAllOr("user")) {
    userResults = await searchUsersByName({
      query: q as string,
      limit,
      offset,
      currentUserId: Number(userId),
      filter: filter as SearchFilter,
    });
  }

  if (isTypeAllOr("group")) {
    groupResults = await searchGroups({
      limit,
      offset,
      query: q as string,
    });
  }

  if (isTypeAllOr("post")) {
    postResults = await searchPosts({
      limit,
      offset,
      query: q as string,
      currentUserId: Number(userId),
    });
  }

  if (type === "user") {
    searchResults = userResults;
  } else if (type === "post") {
    searchResults = postResults;
  } else if (type === "group") {
    searchResults = groupResults;
  } else if (type === "all") {
    (searchResults as SearchAllData).users = userResults;
    (searchResults as SearchAllData).posts = postResults;
    (searchResults as SearchAllData).groups = groupResults;

    return res.status(200).json(
      await getPagingObject({
        data: searchResults as SearchAllData,
        req,
        total_records: Object.values(searchResults as SearchAllData).reduce(
          (e, n) => e + n.total,
          0
        ),
      })
    );
  }

  return res.status(200).json(
    await getPagingObject({
      data: (searchResults as PaginationData<any>)?.data ?? [],
      total_records: (searchResults as PaginationData<any>)?.total ?? 0,
      req,
    })
  );
};
