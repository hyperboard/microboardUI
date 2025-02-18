import { z } from "zod";

export const claimSchema = z.object({
    authorKeys: z.array(z.string().uuid()).optional(),
    visited: z.array(z.string().uuid()).optional(),
});
