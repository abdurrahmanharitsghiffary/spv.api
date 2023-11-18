import express from "express";
import { baseUrl } from "../lib/baseUrl";
import { limitErrorTrigger } from "../lib/error";
import { Chat } from "../types/chat";
import { Comment } from "../types/comment";
import { Post, PostExtended } from "../types/post";
import { PagingObject } from "../types/response";
import { UserAccount, UserAccountPublic } from "../types/user";
import { getCurrentUrl } from "./getCurrentUrl";
import { SearchAllData } from "../controllers/searchControllers";

const getPrevUrl = ({
  offset,
  limit,
  path,
}: {
  offset: number;
  limit: number;
  path: string;
}): string | null => {
  const url = new URL(path, baseUrl);

  if (offset - limit < 0) {
    if (offset === 0) {
      return null;
    } else {
      offset = 0;
    }
  } else {
    offset = offset - limit;
  }
  url.searchParams.set("limit", limit.toString());
  url.searchParams.set("offset", offset.toString());

  return url.href;
};

const getNextUrl = ({
  offset,
  limit,
  path,
}: {
  offset: number;
  limit: number;
  path: string;
}): string => {
  const url = new URL(path, baseUrl);

  url.searchParams.set("offset", (offset + limit).toString());
  url.searchParams.set("limit", limit.toString());

  return url.href;
};

export const getPagingObject = <T>({
  req,
  data,
  total_records,
}: {
  data: T;
  req: express.Request;
  total_records: number;
}): PagingObject<T> => {
  let { limit = 20, offset = 0 } = req.query;
  offset = Number(offset);
  limit = Number(limit);
  limitErrorTrigger(Number(limit));

  const path = getCurrentUrl(req);

  const dataLength =
    ((data ?? []) as []) instanceof Array
      ? (data as [])?.length ?? 0
      : ((data as SearchAllData)?.posts?.data?.length ?? 0) +
        ((data as SearchAllData)?.users?.data?.length ?? 0);

  return {
    status: "success",
    data,
    pagination: {
      next:
        total_records <= limit ||
        offset >= total_records - limit ||
        dataLength < limit
          ? null
          : getNextUrl({ path, limit, offset }),
      previous: getPrevUrl({ path, limit, offset }),
      current: path,
      result_count: dataLength,
      total_records,
      offset,
      limit,
    },
  };
};
// : `${path}${offset || limit ? "?" : ""}${
//   offset ? `offset=${offset}` : ""
// }${limit ? `limit=${limit}` : ""}`,
