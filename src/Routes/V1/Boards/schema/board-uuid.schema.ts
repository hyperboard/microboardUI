import { z } from "zod";
import { BOARD_UUID_PARAM } from "../types";

export const boardUUIDSchema = z.object({
    [BOARD_UUID_PARAM]: z.string().uuid(),
});
