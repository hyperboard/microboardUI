import { z } from "zod";
import { UserAccessType } from "../types";

export const grantAccessSchema = z.object({
    users: z.array(
        z.object({
            userId: z.number().int(),
            accessType: z.nativeEnum(UserAccessType),
        })
    ),
});
