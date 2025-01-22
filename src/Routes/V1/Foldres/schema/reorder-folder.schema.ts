import { z } from "zod";

export const reorderFolderSchema = z.object({
    items: z.array(
        z.object({
            id: z.union([z.string(), z.number()]).transform((value) => {
                if (typeof value === "string" && !isNaN(Number(value))) {
                    return Number(value);
                }
                return value;
            }),
            order: z.preprocess(
                (value) => {
                    if (typeof value === "string") {
                        const parsedNumber = Number(value);
                        return Number.isNaN(parsedNumber) ? value : parsedNumber;
                    }
                    return value;
                },
                z.number().refine((value) => !Number.isNaN(value), {
                    message: "order must be a valid number",
                })
            ),
        })
    ),
});
