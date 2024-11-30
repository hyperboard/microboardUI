import { hasPermission } from "Routes/V1/Auth/middlewares";

export const hasBoardOwnerPermission = hasPermission('owns', "boards", (req) => req.params[BOARD_UUID_PARAM]);