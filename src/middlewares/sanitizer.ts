import express from "express";

import sanitizeHtml from "sanitize-html";

const clean = (data: any) => {
  data = JSON.stringify(data);

  data = sanitizeHtml(data, { disallowedTagsMode: "escape" });

  data = JSON.parse(data);

  return data;
};

export const sanitizer = () => {
  return (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (Object.keys(req.body).length > 0 && req.body.constructor === Object) {
      req.body = clean(req.body);
    }

    if (Object.keys(req.query).length > 0 && req.query.constructor === Object) {
      req.query = clean(req.query);
    }

    if (
      Object.keys(req.params).length > 0 &&
      req.params.constructor === Object
    ) {
      req.params = clean(req.params);
    }

    next();
  };
};
