import {
  BrowserContext,
  ChromiumBrowser,
  chromium,
  Page,
  FirefoxBrowser,
  firefox,
  WebKitBrowser,
  webkit,
} from "playwright";
import {
  After,
  AfterAll,
  BeforeAll,
  setDefaultTimeout,
  setWorldConstructor,
} from "@cucumber/cucumber";
import { BrowserType, CustomWorld } from "./world.ts";
import { Item } from "microboard-temp";
import fs from "fs";
import path from "path";

setWorldConstructor(CustomWorld);
setDefaultTimeout(70 * 1000);

export const DELAY = { delay: 100 };
export const TIMEOUT = { timeout: 30 * 1000 };
export const SYNC_TIMEOUT = 2 * 1000;

type Browser = ChromiumBrowser | FirefoxBrowser | WebKitBrowser;

export let browser: Browser;
export let browser2: Browser;
export let page: Page;
export let page2: Page;
export let context: BrowserContext;
export let context2: BrowserContext;
export let isSync: boolean;

const options = {
  headless: true,
};

const invokeBrowser = (browser: BrowserType): Promise<Browser> => {
  switch (browser) {
    case "chrome":
      return chromium.launch(options);
    case "firefox":
      return firefox.launch(options);
    case "safari":
      return webkit.launch(options);
    default:
      throw new Error("Please set the proper browser!");
  }
};

const clearScreenshots = (screenshotsDir: string): void => {
  fs.readdir(screenshotsDir, (err, files) => {
    if (err) {
      return;
    }

    for (const file of files) {
      const filePath = path.join(screenshotsDir, file);

      if (file.endsWith(".webm") && fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
          if (err) {
            return;
          }
        });
      }
    }
  });
};

// eslint-disable-next-line prefer-arrow-callback
BeforeAll(async function (this) {
  const screenshotsDir1 = path.join("", "features/screenshots/context1");
  clearScreenshots(screenshotsDir1);

  const browserType = (this.parameters.browser as BrowserType) ?? "chrome";
  browser = await invokeBrowser(browserType);
  context = await browser.newContext({
    // uncomment to record video
    acceptDownloads: true,
    recordVideo: { dir: "features/screenshots/context1" },
    viewport: { width: 1200, height: 800 },
  });

  page = await context.newPage();
  await page.goto(`http://api_dev:8000`, {
    waitUntil: "load",
  });
  await page.waitForURL(/.*\/boards\/.*/g);

  isSync = Boolean(this.parameters.isSync);
  if (isSync) {
    const screenshotsDir2 = path.join("", "features/screenshots/context2");
    clearScreenshots(screenshotsDir2);
    browser2 = await invokeBrowser(browserType);
    context2 = await browser2.newContext({
      // uncomment to record video
      acceptDownloads: true,
      recordVideo: { dir: "features/screenshots/context2" },
      viewport: { width: 1200, height: 800 },
    });

    page2 = await context2.newPage();
    const boardId = await page.evaluate(() =>
      window.app.getBoard().getBoardId(),
    );
    await page2.goto(`http://api_dev:8000/boards/${boardId}`, {
      waitUntil: "load",
    });
    await page2.waitForURL(/.*\/boards\/.*/g);
    await page2.waitForFunction(() => {
      const board = window.app.getBoard();
      return board.getInterfaceType() === "edit";
    });
  }
});

After(async () => {
  await page.evaluate(() => {
    const board = window.app.getBoard();
    const items = board.items.listAll();

    items.forEach((item) => {
      board.remove(item);
    });

    // window.localStorage.clear();
    // window.sessionStorage.clear();
  });
});

AfterAll(async () => {
  await page.close();
  await context.close();
  await browser.close();

  if (isSync) {
    await page2.close();
    await context2.close();
    await browser2.close();
  }
});

export const getItem = async (): Promise<Item> => {
  return await page.evaluate(() => {
    const board = window.app.getBoard();
    return board.items.listAll()[0];
  });
};

export const getSelectedItem = async (): Promise<Item> => {
  return await page.evaluate(() => {
    const board = window.app.getBoard();
    return board.selection.list()[0];
  });
};
