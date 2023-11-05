import express from "express";
// import { RequestError } from "../lib/error";
import { Post } from "../types/post";
import { UserAccountPublic } from "../types/user";
import { searchUsersByName } from "../utils/findUser";
import { getPagingObject } from "../utils/getPagingObject";
import { searchPosts } from "../utils/findPost";
import { ExpressRequestExtended } from "../types/request";

export type PaginationData<T> = { data: T; total: number };
export type SearchAllData = {
  posts: PaginationData<Post[]>;
  users: PaginationData<UserAccountPublic[]>;
};
// const searchType: string[] = ["user", "post", "all"];

export interface SearchcResult {
  posts?: Post[];
  users?: UserAccountPublic[];
}

export const getSearchResults = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req as ExpressRequestExtended;
  let { type = "all", q = "", limit = 20, offset = 0 } = req.query;

  offset = Number(offset);
  limit = Number(limit);
  let searchResults:
    | PaginationData<Post[]>
    | PaginationData<UserAccountPublic[]>
    | SearchAllData
    | {} = {};
  const userResults = await searchUsersByName({
    query: q as string,
    limit,
    offset,
    currentUserId: Number(userId),
  });

  const postResults = await searchPosts({
    limit,
    offset,
    query: q as string,
    currentUserId: Number(userId),
  });

  if (type === "user") {
    searchResults = userResults;
  } else if (type === "post") {
    searchResults = postResults;
  } else if (type === "all") {
    (searchResults as SearchAllData).users = userResults;
    (searchResults as SearchAllData).posts = postResults;

    return res.status(200).json(
      getPagingObject({
        data: searchResults as SearchAllData,
        req,
        total_records:
          ((searchResults as SearchAllData)?.posts?.total ?? 0) +
          ((searchResults as SearchAllData)?.users?.total ?? 0),
      })
    );
  }

  return res.status(200).json(
    getPagingObject({
      data: (searchResults as PaginationData<any>)?.data ?? [],
      total_records: (searchResults as PaginationData<any>)?.total ?? 0,
      req,
    })
  );
};
