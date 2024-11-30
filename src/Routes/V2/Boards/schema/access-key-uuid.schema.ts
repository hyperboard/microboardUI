import { z } from "zod";
import { ACCESS_KEY_PARAM } from "../types";

export const accessKeyUUIDSchema = z.object({
  [ACCESS_KEY_PARAM]: z.string().uuid(),
});