import express from "express";
import { BASE_URL } from "../lib/consts";
import { ApiPagingObjectResponse } from "../types/response";
import { SearchAllData } from "../controllers/search.controllers";
import { z } from "zod";
import { zLimit, zOffset } from "../schema";

export const getCurrentUrl = (req: express.Request) =>
  new URL(req.originalUrl, BASE_URL).href;

const getPrevUrl = ({
  offset,
  limit,
  path,
}: {
  offset: number;
  limit: number;
  path: string;
}): string | null => {
  const url = new URL(path, BASE_URL);

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
  const url = new URL(path, BASE_URL);

  url.searchParams.set("offset", (offset + limit).toString());
  url.searchParams.set("limit", limit.toString());

  return url.href;
};

export const getPagingObject = async <T>({
  req,
  data,
  total_records,
}: {
  data: T;
  req: express.Request;
  total_records: number;
}): Promise<ApiPagingObjectResponse<T>> => {
  let { limit = 20, offset = 0 } = req.query;
  offset = Number(offset);
  limit = Number(limit);

  await z
    .object({
      query: z.object({
        limit: zLimit,
        offset: zOffset,
      }),
    })
    .parseAsync({
      query: req.query,
    });

  const path = getCurrentUrl(req);

  const dataLength =
    ((data ?? []) as []) instanceof Array
      ? (data as [])?.length ?? 0
      : ((data as SearchAllData)?.posts?.data?.length ?? 0) +
        ((data as SearchAllData)?.users?.data?.length ?? 0);

  return {
    statusCode: 200,
    success: true,
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
      resultCount: dataLength,
      totalRecords: total_records,
      offset,
      limit,
    },
  };
};
