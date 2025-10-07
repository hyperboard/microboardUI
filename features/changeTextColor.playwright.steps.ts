import { When, Then } from "@cucumber/cucumber";
import {
  DELAY,
  TIMEOUT,
  page,
} from "./helpers/custom-hooks.playwright.steps.ts";
import { expect } from "chai";

const getColorBtnId = (): string => {
  return "#ChangeTextColor";
};

const getColorPickerBtnLocator = (textColor: string): string => {
  return `//button[@id="TextColorrgb(${textColor})"]`;
};

When("User changed text color on {string}", async (textColor: string) => {
  const colorBtnId = getColorBtnId();
  const colorPickerBtnLocator = getColorPickerBtnLocator(textColor);

  const changeTextColorBtn = page.locator(colorBtnId);
  await changeTextColorBtn.waitFor(TIMEOUT);
  await changeTextColorBtn.click(DELAY);

  const currentTextColorBtn = page.locator(colorPickerBtnLocator);
  await currentTextColorBtn.waitFor(TIMEOUT);
  await currentTextColorBtn.click(DELAY);
});

Then("Text color changed on {string}", async (expectedTextColor: string) => {
  const textColor = await page.evaluate(() => {
    const board = window.app.getBoard();
    const item = board.items.listAll()[0];
    return item.getRichText()?.getFontColor();
  });

  expect(textColor).to.be.include(expectedTextColor);
});

Then(
  "Text color changed on the panel on {string}",
  async (expectedTextColor: string) => {
    const isActiveTextColor = await page.evaluate(() => {
      const svgId = "TextColorBar";
      const panelTextColor = document.getElementById(svgId);
      return panelTextColor?.style.backgroundColor;
    });

    expect(isActiveTextColor).to.be.equal(expectedTextColor);
  },
);
