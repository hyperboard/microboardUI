import { App } from "App";
import { frontConf } from "Config";
import { conf } from "microboard-temp";

declare module "*.css";
declare module "*.module.css";
declare module "*.svg";
declare module "*.png";

declare module "https://www.unpkg.com/microboard-ui-temp/dist/index.js" {
  import type { App } from "App";
  export function initInter(): Promise<void>;
  export function createApp(isHistory?: boolean): App;
}

declare module "https://unpkg.com/microboard-ui-temp/dist/index.js" {
  import type { App } from "App";
  export function initInter(): Promise<void>;
  export function createApp(isHistory?: boolean): App;
}

declare global {
  interface ImportMetaEnv {
    readonly EMBED_URL: string;
    readonly TOLGEE_API_KEY?: string;
    readonly TOLGEE_API_URL?: string;
    readonly TOLGEE_PROJECT_ID?: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }

  interface Window {
    app: App;
    showDebug: boolean;
    enableTemplateCreating: boolean;
    enableGravity: boolean;
    enableForceGraph: boolean;
    enableVideos: boolean;
    enableGames: boolean;
    enableAI: boolean;
    enableDiagrams: boolean;
    enableLogger: () => void;
    disableLogger: () => void;
    MICROBOARD_CONFIG: typeof conf;
    MICROBOARD_FRONT_CONFIG: typeof frontConf;

    /**Embeder */
    microboardOpener: {
      selectBoard: (args: {
        success: () => void;
        error: () => void;
        cancel: () => void;
      }) => void;
    };
  }
}

export {};
