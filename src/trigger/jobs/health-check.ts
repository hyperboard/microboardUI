import { client } from "../index";
import { invokeTrigger } from "@trigger.dev/sdk";

export const healthCheckJob = client.defineJob({
    id: "download-miro-board",
    name: "Download Miro Board",
    version: "0.0.0",
    trigger: invokeTrigger(),
    run: async (payload, io, ctx) => {
        await io.logger.info("This is simple logger");
        console.log("download-miro-board");
    },
});
