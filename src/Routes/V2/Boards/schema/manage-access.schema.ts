import { createBoardSchema } from "./create-board.schema";
import { grantAccessSchema } from "./grant-access.schema";

export const manageAccessSchema = createBoardSchema.pick({
  directAccessType: true,
  isPublic: true,
}).merge(grantAccessSchema);