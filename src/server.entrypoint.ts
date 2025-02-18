import { getApp } from "./getApp";
import dotenv from "dotenv";

dotenv.config();

getApp().then(({ server }) => {
    server.listen(process.env.API_PORT, () => {
        console.log("API is running at http://localhost:" + process.env.API_PORT);
    });
});
