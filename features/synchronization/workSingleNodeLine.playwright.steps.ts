import { Given, Then, When } from "@cucumber/cucumber";
import {
  context2,
  DELAY,
  page,
  page2,
  SYNC_TIMEOUT,
} from "../helpers/custom-hooks.playwright.steps.ts";
import { expect } from "chai";
import { getText } from "./syncHelpers.ts";

Given("Board with text {string} at client A and B", async (text: string) => {
  await page.evaluate(() => {
    const board = window.app.getBoard();
    if (!board.tools.getAddText()) {
      board.tools.addText();
    }
  });
  await page.mouse.click(300, 300);
  await page.waitForTimeout(SYNC_TIMEOUT);
  await page2.waitForTimeout(SYNC_TIMEOUT);

  await page.evaluate((text) => {
    const board = window.app.getBoard();
    const item = board.items.listAll()[0];

    item.getRichText()?.editor.editor.insertText(text);
  }, text);

  await page.waitForTimeout(SYNC_TIMEOUT);
  await page2.waitForTimeout(SYNC_TIMEOUT);
});

When("Client B lost the connection", async () => {
  await context2.setOffline(true);
});

When("Client B restored the connection", async () => {
  await context2.setOffline(false);
});

When(
  "Client A inserted {string} after text {string}",
  async (insertedText: string, text: string) => {
    await page.mouse.click(300, 300);

    Array.from(text).forEach(async (_element) => {
      await page.keyboard.press("ArrowRight", { delay: 100 });
    });

    await page.keyboard.type(insertedText);
  },
);

When(
  "Client B inserted {string} after text {string}",
  async (insertedText: string, text: string) => {
    await page.waitForTimeout(SYNC_TIMEOUT);
    await page2.waitForTimeout(SYNC_TIMEOUT);
    await page2.mouse.dblclick(300, 300, { delay: 100 });
    await page2.mouse.dblclick(300, 300, { delay: 100 });
    await page2.mouse.click(300, 300, { delay: 100 });

    Array.from(text).forEach(async (_element) => {
      await page2.keyboard.press("ArrowRight", { delay: 100 });
    });

    await page2.keyboard.type(insertedText);
  },
);

Then("The text is the same on both clients", async () => {
  await page.waitForTimeout(SYNC_TIMEOUT);
  await page2.waitForTimeout(SYNC_TIMEOUT);

  const textA = await getText(page);
  const textB = await getText(page2);

  expect(textA).to.be.equal(textB);
});

Then("The text on both clients is: {string}", async (expectText: string) => {
  const textA = await getText(page);
  const textB = await getText(page2);

  expect(textA?.replace(/(\r\n|\n|\r)/gm, "")).to.be.equal(expectText);
  expect(textB?.replace(/(\r\n|\n|\r)/gm, "")).to.be.equal(expectText);
});

When("Client A deleted the last word {string}", async (deletedWord: string) => {
  const initText = "привет мир";

  await page.mouse.click(305, 305);

  Array.from(initText).forEach(async (_element) => {
    await page.keyboard.press("ArrowRight", { delay: 100 });
  });

  Array.from(deletedWord).forEach(async (_element) => {
    await page.keyboard.press("Backspace", { delay: 100 });
  });
});

When(
  "Client B typed {string} after word {string}",
  async (typedText: string, text: string) => {
    await page2.mouse.dblclick(300, 300);
    await page2.mouse.dblclick(300, 300);

    Array.from(text).forEach(async (_element) => {
      await page2.keyboard.press("ArrowRight", { delay: 100 });
    });

    await page2.keyboard.press("ArrowRight", { delay: 100 });
    await page2.keyboard.type(typedText);
  },
);

When(
  "Client A typed {string} after word {string}",
  async (typedText: string, text: string) => {
    await page.mouse.click(300, 300);

    Array.from(text).forEach(async (_element) => {
      await page.keyboard.press("ArrowRight", { delay: 100 });
    });

    await page.keyboard.press("ArrowRight", { delay: 100 });
    await page.keyboard.type(typedText);
  },
);

When("Client B deleted the last word {string}", async (deletedWord: string) => {
  const initText = "привет мир";
  await page2.keyboard.press("V", DELAY);

  await page2.mouse.dblclick(300, 300, DELAY);
  await page2.mouse.click(300, 300, DELAY);

  Array.from(initText).forEach(async (_element) => {
    await page2.keyboard.press("ArrowRight", { delay: 100 });
  });

  Array.from(deletedWord).forEach(async (_element) => {
    await page2.keyboard.press("Backspace", { delay: 100 });
  });

  await page2.waitForTimeout(SYNC_TIMEOUT);
  await page.waitForTimeout(SYNC_TIMEOUT);
});
