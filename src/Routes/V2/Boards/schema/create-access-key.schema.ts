import { AccessKeyType } from "drizzle/entities/boardAccessKeys";
import { z } from "zod";

export const createAccessKeySchema = z.object({
  keyType: z.nativeEnum(AccessKeyType),
});