import { When, Then } from "@cucumber/cucumber";
import { DELAY, page } from "./helpers/custom-hooks.playwright.steps.ts";
import { expect } from "chai";

When("User copy the text", async () => {
  await page.keyboard.press("Control+A", DELAY);
  await page.keyboard.press("Control+C", DELAY);
  await page.keyboard.press("Delete", DELAY);
});

Then(
  "Text {string} of object number {int} has been inserted in full",
  async (expectedText: string, objectNumber: number) => {
    const text = await page.evaluate((objectNumber) => {
      const board = window.app.getBoard();
      const item = board.items.listAll()[objectNumber];

      return item.getRichText()?.getTextString().replace(/\n/g, "");
    }, objectNumber);

    expect(text).to.be.equal(expectedText);
  },
);

Then("Text saved {int} paragraphs", async (expectedParagraph: number) => {
  const paragraphs = await page.evaluate(() => {
    const board = window.app.getBoard();
    const item = board.items.listAll()[0];

    return item.getRichText()?.getTextString().split(/\n/);
  });

  expect(paragraphs?.length).to.be.equal(expectedParagraph);
});

Then(
  "Text container of object {int} width: {int}",
  async (objectNumber: number, expectedWidth: number) => {
    const width = await page.evaluate((objectNumber) => {
      const board = window.app.getBoard();
      const item = board.items.listAll()[objectNumber];

      const container = item.getRichText()?.getTransformedContainer();

      const width = container?.getWidth() || 0;
      return Math.ceil(width);
    }, objectNumber);

    expect(width).to.be.equal(expectedWidth);
  },
);

Then(
  "Text container of object {int} height: {int}",
  async (objectNumber: number, expectedHeight: number) => {
    const height = await page.evaluate((objectNumber) => {
      const board = window.app.getBoard();
      const item = board.items.listAll()[objectNumber];

      const container = item.getRichText()?.getTransformedContainer();
      const height = container?.getHeight() || 0;
      return Math.ceil(height);
    }, objectNumber);

    expect(height).to.be.equal(expectedHeight);
  },
);

Then("Uses a maximum line width of {int} pixels", async (width: number) => {
  const textWidth = await page.evaluate(() => {
    const board = window.app.getBoard();
    const item = board.items.listAll()[0];
    const width = item.getMbr().getWidth();
    return Math.ceil(width);
  });

  expect(textWidth).to.be.equal(width);
});

Then(
  "Paragraph text number: {int} has text: {string}",
  async (paragraphNumber: number, expectedText: string) => {
    const style = await page.evaluate((paragraphNumber) => {
      const board = window.app.getBoard();
      const item = board.items.listAll()[0];

      const paragraph = item.getRichText()?.getText()[paragraphNumber];
      return paragraph?.type === "paragraph" && paragraph.children[0].text;
    }, paragraphNumber);

    expect(style).to.be.include(expectedText);
  },
);
