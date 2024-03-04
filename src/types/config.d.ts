import {Config} from "../interfaces/config.js";

declare module "*/config.*.json"{
    const value: Config;
    export = value;
}