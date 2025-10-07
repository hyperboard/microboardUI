import { Given, Then, When } from "@cucumber/cucumber";
import {
  DELAY,
  page,
  page2,
  SYNC_TIMEOUT,
  TIMEOUT,
} from "../helpers/custom-hooks.playwright.steps.ts";
import { expect } from "chai";

Given(
  "Board with the text {string} for clients A and B",
  async (text: string) => {
    await page.evaluate(() => {
      const board = window.app.getBoard();
      if (!board.tools.getAddText()) {
        board.tools.addText();
      }
    });
    await page.mouse.click(300, 300);
    await page.waitForTimeout(SYNC_TIMEOUT);

    await page.evaluate((text) => {
      const board = window.app.getBoard();
      const item = board.items.listAll()[0];

      if (
        item.itemType !== "Image" &&
        item.itemType !== "Drawing" &&
        item.itemType !== "Placeholder"
      ) {
        item.getRichText()?.editor.editor.insertText(text);
      }
    }, text);

    await page.mouse.click(300, 300);

    await page.waitForTimeout(SYNC_TIMEOUT);
  },
);

Given(
  "Added text {string} in {string} style in {string} for clients A and B",
  async (boldText: string, textStyle: string, text: string) => {
    await page.mouse.dblclick(300, 300, { delay: 100 });
    await page.mouse.click(300, 300, { delay: 100 });

    Array.from(text).forEach(async (_element) => {
      await page.keyboard.press("ArrowRight", { delay: 100 });
    });

    await page.keyboard.down("Shift");
    Array.from(boldText).forEach(async (_element) => {
      await page.keyboard.press("ArrowRight", { delay: 100 });
    });
    await page.keyboard.up("Shift");

    // change text style
    const pickChangeFontStyleId = "button#ChangeFontStyle";

    const pickChangeFontStyle = page.locator(pickChangeFontStyleId);
    await pickChangeFontStyle.waitFor(TIMEOUT);
    await pickChangeFontStyle.click(DELAY);

    const pickerFontStyleId = `button#ChangeFont${textStyle}`;

    const pickerFontStyle = page.locator(pickerFontStyleId);
    await pickerFontStyle.waitFor(TIMEOUT);
    await pickerFontStyle.click(DELAY);

    await page.waitForTimeout(SYNC_TIMEOUT);
  },
);

When(
  "Client A deleted the first word {string}",
  async (deletedWord: string) => {
    await page.mouse.click(300, 300, { delay: 100 });

    Array.from(deletedWord).forEach(async (_element) => {
      await page.keyboard.press("ArrowRight", { delay: 100 });
    });

    Array.from(deletedWord).forEach(async (_element) => {
      await page.keyboard.press("Backspace", { delay: 100 });
    });

    await page.waitForTimeout(SYNC_TIMEOUT);
  },
);

When(
  "Client B deleted the first word {string}",
  async (deletedWord: string) => {
    await page2.keyboard.press("V", DELAY);

    await page2.mouse.dblclick(300, 300, DELAY);
    await page2.mouse.click(300, 300, { delay: 100 });

    Array.from(deletedWord).forEach(async (_element) => {
      await page2.keyboard.press("ArrowRight", { delay: 100 });
    });

    Array.from(deletedWord).forEach(async (_element) => {
      await page2.keyboard.press("Backspace", { delay: 100 });
    });

    await page2.waitForTimeout(SYNC_TIMEOUT);
  },
);

Then(
  "The text on both clients has {string} text in bold style",
  async (boldText: string) => {
    await page.mouse.click(300, 300);
    await page.mouse.click(300, 300);

    const textBoldA = await page.evaluate(() => {
      return document?.querySelector("strong")?.textContent;
    });

    await page2.mouse.click(300, 300);
    await page2.mouse.click(300, 300);

    const textBoldB = await page2.evaluate(() => {
      return document?.querySelector("strong")?.textContent;
    });

    expect(textBoldA).to.be.equal(boldText);
    expect(textBoldB).to.be.equal(boldText);
  },
);

Then(
  "The text on both clients has {string} and {string} text in bold style",
  async (boldText: string, boldText2: string) => {
    await page.mouse.dblclick(300, 300, { delay: 100 });
    await page.mouse.click(300, 300);

    const textBoldA = await page.evaluate(() => {
      const strongNode = Array.from(document?.querySelectorAll("strong"));
      const strongNode1 = strongNode[0] ? strongNode[0].textContent : "";
      const strongNode2 = strongNode[1] ? strongNode[1].textContent : "";

      return [strongNode1, strongNode2];
    });

    await page2.mouse.click(300, 300);
    await page2.mouse.click(300, 300);

    const textBoldB = await page2.evaluate(() => {
      const strongNode = Array.from(document?.querySelectorAll("strong"));
      const strongNode1 = strongNode[0] ? strongNode[0].textContent : "";
      const strongNode2 = strongNode[1] ? strongNode[1].textContent : "";

      return [strongNode1, strongNode2];
    });

    expect(textBoldA).to.be.equal([boldText, boldText2]);
    expect(textBoldB).to.be.equal([boldText, boldText2]);
  },
);

Then(
  "The text on both clients has {string} text in italics style",
  async (italicsText: string) => {
    await page.mouse.click(300, 300);
    await page.mouse.click(300, 300);

    const textBoldA = await page.evaluate(() => {
      return document?.querySelector("em")?.textContent;
    });

    await page2.mouse.click(300, 300);
    await page2.mouse.click(300, 300);

    const textBoldB = await page2.evaluate(() => {
      return document?.querySelector("em")?.textContent;
    });

    expect(textBoldA).to.be.equal(italicsText);
    expect(textBoldB).to.be.equal(italicsText);
  },
);

When("Client A bolded the first word {string}", async (boldWord: string) => {
  await page.mouse.click(300, 300, { delay: 100 });

  await page.keyboard.down("Shift");
  Array.from(boldWord).forEach(async (_element) => {
    await page.keyboard.press("ArrowRight", { delay: 100 });
  });
  await page.keyboard.up("Shift");

  await page.waitForTimeout(SYNC_TIMEOUT);

  const pickChangeFontStyleId = "button#ChangeFontStyle";

  const pickChangeFontStyle = page.locator(pickChangeFontStyleId);
  await pickChangeFontStyle.waitFor(TIMEOUT);
  await pickChangeFontStyle.click(DELAY);

  const pickerFontStyleId = "button#ChangeFontBold";

  const pickerFontStyle = page.locator(pickerFontStyleId);
  await pickerFontStyle.waitFor(TIMEOUT);
  await pickerFontStyle.click(DELAY);
});

When("Client B bolded the first word {string}", async (boldWord: string) => {
  await page2.keyboard.press("V", DELAY);

  await page2.mouse.dblclick(300, 300, DELAY);
  await page2.mouse.click(300, 300, { delay: 100 });

  await page2.keyboard.down("Shift");
  Array.from(boldWord).forEach(async (_element) => {
    await page2.keyboard.press("ArrowRight", { delay: 100 });
  });
  await page2.keyboard.up("Shift");

  await page2.waitForTimeout(SYNC_TIMEOUT);

  const pickChangeFontStyleId = "button#ChangeFontStyle";

  const pickChangeFontStyle = page2.locator(pickChangeFontStyleId);
  await pickChangeFontStyle.waitFor(TIMEOUT);
  await pickChangeFontStyle.click(DELAY);

  const pickerFontStyleId = "button#ChangeFontBold";

  const pickerFontStyle = page2.locator(pickerFontStyleId);
  await pickerFontStyle.waitFor(TIMEOUT);
  await pickerFontStyle.click(DELAY);
});

When(
  "Client A delete bold style in word {string} in text {string}",
  async (boldText: string, text: string) => {
    await page.mouse.dblclick(300, 300, { delay: 100 });
    await page.mouse.click(300, 300, { delay: 100 });

    Array.from(text).forEach(async (_element) => {
      await page.keyboard.press("ArrowRight", { delay: 100 });
    });

    await page.keyboard.down("Shift");
    Array.from(boldText).forEach(async (_element) => {
      await page.keyboard.press("ArrowRight", { delay: 100 });
    });
    await page.keyboard.up("Shift");

    // change text style
    const pickChangeFontStyleId = "button#ChangeFontStyle";

    const pickChangeFontStyle = page.locator(pickChangeFontStyleId);
    await pickChangeFontStyle.waitFor(TIMEOUT);
    await pickChangeFontStyle.click(DELAY);

    const pickerFontStyleId = `button#ChangeFontBold`;

    const pickerFontStyle = page.locator(pickerFontStyleId);
    await pickerFontStyle.waitFor(TIMEOUT);
    await pickerFontStyle.click(DELAY);
  },
);

When(
  "Client B delete bold style in word {string} in text {string}",
  async (boldText: string, text: string) => {
    await page2.keyboard.press("V", DELAY);

    await page2.mouse.dblclick(300, 300, { delay: 100 });
    await page2.mouse.click(300, 300, { delay: 100 });

    Array.from(text).forEach(async (_element) => {
      await page2.keyboard.press("ArrowRight", { delay: 100 });
    });

    await page2.keyboard.down("Shift");
    Array.from(boldText).forEach(async (_element) => {
      await page2.keyboard.press("ArrowRight", { delay: 100 });
    });
    await page2.keyboard.up("Shift");

    // change text style
    const pickChangeFontStyleId = "button#ChangeFontStyle";

    const pickChangeFontStyle = page2.locator(pickChangeFontStyleId);
    await pickChangeFontStyle.waitFor(TIMEOUT);
    await pickChangeFontStyle.click(DELAY);

    const pickerFontStyleId = `button#ChangeFontBold`;

    const pickerFontStyle = page2.locator(pickerFontStyleId);
    await pickerFontStyle.waitFor(TIMEOUT);
    await pickerFontStyle.click(DELAY);
  },
);

When(
  "Client A split the text into two lines after {string}",
  async (text: string) => {
    Array.from(text).forEach(async (_element) => {
      await page.keyboard.press("ArrowRight", { delay: 100 });
    });

    await page.keyboard.press("Enter", { delay: 100 });
  },
);

When(
  "Client B split the text into two lines after {string}",
  async (text: string) => {
    await page2.keyboard.press("V", DELAY);

    await page2.mouse.dblclick(300, 300, { delay: 100 });
    await page2.mouse.click(300, 300, { delay: 100 });

    Array.from(text).forEach(async (_element) => {
      await page2.keyboard.press("ArrowRight", { delay: 100 });
    });

    await page2.keyboard.press("Enter", { delay: 100 });
  },
);
