import { getApp } from "./getApp";

getApp().then((app) => {
    app.listen(process.env.API_PORT, () => {
        console.log("API is running at http://localhost:" + process.env.API_PORT);
    });
});
