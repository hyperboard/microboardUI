import { When, Then } from "@cucumber/cucumber";
import {
  DELAY,
  page,
  TIMEOUT,
} from "./helpers/custom-hooks.playwright.steps.ts";
import { expect } from "chai";

When(
  "User changed text highlight color on {string}",
  async (textHighlightColor: string) => {
    const textHighlightColorBtnId = "button#ChangeTextHighlight";
    const textHighlightColorPickerId = `//button[@id="TextHighlightrgb(${textHighlightColor})"]`;

    const textHighlightColorBtn = page.locator(textHighlightColorBtnId);
    await textHighlightColorBtn.waitFor(TIMEOUT);
    await textHighlightColorBtn.click(DELAY);

    const currentTextColorBtn = page.locator(textHighlightColorPickerId);
    await currentTextColorBtn.waitFor(TIMEOUT);
    await currentTextColorBtn.click(DELAY);
  },
);

Then(
  "Text highlight color changed on {string}",
  async (expectedTextColor: string) => {
    const textColor = await page.evaluate(() => {
      const board = window.app.getBoard();
      const item = board.items.listAll()[0];

      return item.getRichText()?.getFontHighlight();
    });

    expect(textColor).to.be.include(expectedTextColor);
  },
);

Then(
  "Text highlight color changed on the panel on {string}",
  async (expectedTextColor: string) => {
    const isActiveTextColor = await page.evaluate(() => {
      const svgId = "TextHighlightHighlight";
      const panelTextColor = document.getElementById(svgId);
      return panelTextColor?.style.backgroundColor;
    });

    expect(isActiveTextColor).to.be.equal(expectedTextColor);
  },
);
