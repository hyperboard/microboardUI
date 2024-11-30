import { z } from "zod";

export const folderPayloadSchema = z.object({
  title: z.string().optional().default(''),
  parentFolder: z.number().int().optional()
});