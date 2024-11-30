import { z } from "zod";
import { UserAccessType } from "../types";

export const getGrantedUsersSchema = z.object({
  accessType: z.nativeEnum(UserAccessType).optional()
});