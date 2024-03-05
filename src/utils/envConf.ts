import fs from "fs";
import path from "path";

import {Config} from "../interfaces/config.js";

const __dirname = import.meta.dirname;
const prodConfigString = fs.readFileSync(path.resolve(__dirname, "../../env/config.prod.json"), "utf8");
const devConfigString = fs.readFileSync(path.resolve(__dirname, "../../env/config.dev.json"), "utf8");
const prodConfig: Config = JSON.parse(prodConfigString);
const devConfig: Config = JSON.parse(devConfigString);

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

console.log(`Config type: ${config.type}`);
export default config;
