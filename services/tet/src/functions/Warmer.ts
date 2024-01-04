/**
 * Noop that just keeps the function app warm
 */

import { app } from "@azure/functions";

app.timer("Warmer", {
    schedule: "0 */3 * * * *",
    handler: (t, c) => {
        c.log("1");
    },
});
