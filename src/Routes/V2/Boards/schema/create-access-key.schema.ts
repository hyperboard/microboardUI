import { AccessKeyType } from "drizzle/entities/boardAccessKeys";
import { z } from "zod";

export const createAccessKeySchema = z.object({
  boardUUID: z.string().uuid(),
  keyType: z.nativeEnum(AccessKeyType),
});