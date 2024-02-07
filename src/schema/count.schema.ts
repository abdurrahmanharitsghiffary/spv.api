import { z } from "zod";
import { defaultTypes } from "../controllers/count.controller";

const countType = z.any().refine(
  (arg) => {
    if (arg === undefined) return true;
    const st: string[] = arg?.split(",");
    let isValid = true;

    st.forEach((type) => {
      if (!defaultTypes.includes(type as any)) isValid = false;
    });

    return isValid;
  },
  {
    message: `Invalid provided type query, expected ${defaultTypes.join(
      ", "
    )} or multiple combination with (,). correct example: 'liked_posts,unread_messages' or 'liked_posts'`,
  }
);

export const getCountsValidation = z.object({
  query: z.object({
    type: countType,
  }),
});
