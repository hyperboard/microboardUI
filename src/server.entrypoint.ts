import { getMetricsApp } from "getMetricsApp";
import { getApp } from "./getApp";

getApp().then((app) => {
    app.listen(process.env.PORT, () => {
        console.log("API is running at http://localhost:" + process.env.PORT);
    });
    const metricsApp = getMetricsApp();
    metricsApp.listen(process.env.METRICS_PORT, () => {
        console.log(
            "Metrics is running at http://localhost:" + process.env.METRICS_PORT
        );
    });
});
