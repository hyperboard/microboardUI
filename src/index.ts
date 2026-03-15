export { App, createApp } from "App";
export { customCursors } from "features/Cursors";
export { initInter } from "initI18N";
export * from "shared/api";
export { default as sprite } from "./shared/ui-lib/Icon/sprite.svg";
import "public/index.css";
import "./global.d";
import { initTheme } from "shared/lib/uiTheme";

initTheme();
