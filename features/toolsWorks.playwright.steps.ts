import { Then, Given } from "@cucumber/cucumber";
import { page } from "./helpers/custom-hooks.playwright.steps.ts";
import { expect } from "chai";

Given("Text added to x: {int}, y: {int}", async (x: number, y: number) => {
  await page.evaluate(() => {
    const board = window.app.getBoard();
    if (!board.tools.getAddText()) {
      board.tools.addText();
    }
  });
  await page.mouse.click(x, y);
});

Then("Item added to the board", async () => {
  const itemLength = await page.evaluate(() => {
    const board = window.app.getBoard();
    return board.items.listAll().length;
  });

  expect(itemLength).to.be.equal(1);
});

Then("Panel is near item and item has a cursor", async () => {
  const isCursor = await page.evaluate(() => {
    const board = window.app.getBoard();
    return board.selection.getContext();
  });

  expect(isCursor).to.be.equal("EditTextUnderPointer");
});

Then("Text has a placeholder", async () => {
  const placeholder = await page.evaluate(() => {
    return document.querySelector("div[data-placeholder='Type something']");
  });

  expect(placeholder).to.be.ok;
});

Then("Placeholder not extend beyond the text", async () => {
  const [textWidth, placeholderWidth] = await page.evaluate(() => {
    const textElWidth: number =
      document.getElementById("TextEditor")?.offsetWidth ?? 0;
    const element = document.querySelector(
      "div[data-placeholder='Type something']",
    );

    const placeholderStyles = element
      ? window.getComputedStyle(element, "::before")
      : null;

    const placeholderWidth = placeholderStyles
      ?.getPropertyValue("width")
      .replace("px", "");

    return [textElWidth, Number(placeholderWidth)];
  });

  expect(placeholderWidth).to.be.at.most(textWidth);
});
