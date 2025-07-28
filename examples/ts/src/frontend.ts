/* eslint-disable no-var */
import { api, frontConf } from "microboard-ui-temp";
frontConf.wsURL = "wss://dev-app.microboard.io/ws";
api.updateURL("https://dev-app.microboard.io/api/v1");

import { App, createApp, initInter, customCursors } from "microboard-ui-temp";
console.log("cursors", { ...customCursors });

import "microboard-ui-temp/style";

window.showDebug = false;
window.enableTemplateCreating = false;
window.enableDiagrams = false;
window.enableVideos = true;
window.enableGames = true;

async function initializeApp() {
  await initInter();
  window.app = createApp();
  window.enableLogger = window.app.enableLogger;
  window.disableLogger = window.app.disableLogger;

  window.app.account.init().finally(() => {
    window.app.connection.connect().then(() => {
      window.app.render();
    });
  });
}

initializeApp();
