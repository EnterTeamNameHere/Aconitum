
import devConfig from "../env/config.dev.json";
import prodConfig from "../env/config.prod.json";

import {Config} from "./interfaces/config.js";

let config: Config;

if (process.env.NODE_ENV === "production") {
    if (prodConfig.type !== "PROD") {
        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        throw "Config type is abnormal."; // ミスってconfig間違えるくらいなら例外で落としたほうがマシ
    }
    config = prodConfig;
} else {
    if (devConfig.type !== "DEV") {
        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        throw "Config type is abnormal."; // ミスってconfig間違えるくらいなら例外で落としたほうがマシ
    }
    config = devConfig;
}

export = config;
