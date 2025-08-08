import { createApp, initInter, customCursors, sprite } from "../index";
console.log("prevent shake", customCursors, sprite);

import "./index.css";

window.showDebug = false;
window.enableTemplateCreating = false;
window.enableDiagrams = false;
window.enableVideos = true;
window.enableGames = true;
window.microboardFrontendConfig.apiURL = "testurl";

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
