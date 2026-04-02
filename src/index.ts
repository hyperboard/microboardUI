export { App, createApp } from "App";
export { customCursors } from "features/Cursors";
export { initInter } from "initI18N";
export * from "shared/api";
export { default as sprite } from "./shared/ui-lib/Icon/sprite.svg";
import "microboard-temp/style";
import "./global.d";
import { initTheme } from "shared/lib/uiTheme";
import { migrateLegacyConsent } from "App/consentStorage";

initTheme();
migrateLegacyConsent();
