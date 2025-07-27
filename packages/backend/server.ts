import { createApp } from "./src/app.js";
import { env } from "./src/config/env.js";

const startServer =  () => {
    const app = createApp();

    app.listen(env.PORT, () => console.log("serevr is good "))
}

startServer()
