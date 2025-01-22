import { hasPermission } from "Routes/V1/Auth/middlewares";
import { BOARD_UUID_PARAM } from "../types";

export const hasBoardOwnerPermission = hasPermission("owns", "boards", (req) => req.params[BOARD_UUID_PARAM]);
export const hasBoardEditPermission = hasPermission("edits", "boards", (req) => req.params[BOARD_UUID_PARAM]);
export const hasBoardViewPermission = hasPermission("reads", "boards", (req) => req.params[BOARD_UUID_PARAM]);
export const hasBoardEditOrViewPermission = hasPermission(
    ["edits", "reads"] as const,
    "boards",
    (req) => req.params[BOARD_UUID_PARAM]
);
