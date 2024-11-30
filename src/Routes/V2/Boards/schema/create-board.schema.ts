import { DirectAccessType, directAccessTypes } from "drizzle/entities/boards";
import { z } from "zod";

export const createBoardSchema = z.object({
  title: z.string().min(1).optional(),
  isPublic: z.boolean().optional(),
  directAccessType: z.nativeEnum(DirectAccessType).optional().default(DirectAccessType.EDIT),
  parentFolder: z.number().int().optional()
});