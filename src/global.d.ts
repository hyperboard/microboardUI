import { App } from "App";
import { frontConf } from "Config";
import { conf } from "microboard-temp";

declare module "*.css";
declare module "*.module.css";
declare module "*.svg";
declare module "*.png";

declare module "https://www.unpkg.com/microboard-ui-temp/dist/index.js" {
  import * as local from "./index";
  export = local;
}

declare global {
  interface Window {
    app: App;
    showDebug: boolean;
    enableTemplateCreating: boolean;
    enableVideos: boolean;
    enableGames: boolean;
    enableAI: boolean;
    enableDiagrams: boolean;
    enableLogger: () => void;
    disableLogger: () => void;
    MICROBOARD_CONFIG: typeof conf;
    MICROBOARD_FRONT_CONFIG: typeof frontConf;
  }
}

export {};
