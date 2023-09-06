import crypto from "crypto";

export const getRandomToken = (): Promise<string> => {
  return new Promise((resolve) =>
    resolve(crypto.randomBytes(32).toString("hex"))
  );
};
