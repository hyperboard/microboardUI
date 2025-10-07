import { Then, When } from "@cucumber/cucumber";
import { page } from "./helpers/custom-hooks.playwright.steps.ts";
import { expect } from "chai";

const textContainer: ITextContainer = {
  width: 0,
  height: 0,
};

interface ITextContainer {
  width: number;
  height: number;
}

When(
  "User transform object beyond the {int} and {int} corner to {int} and {int}",
  async (x: number, y: number, endX: number, endY: number) => {
    const [width, height] = await page.evaluate(() => {
      const board = window.app.getBoard();
      const item = board.items.listAll()[0];

      const richText = item.getRichText();
      richText?.enableRender();
      return [richText?.getWidth() || 0, richText?.getHeight() || 0];
    });

    textContainer.width = width;
    textContainer.height = height;

    await page.mouse.click(x, y);
    await page.mouse.down();
    await page.mouse.move(endX, endY, { steps: 20 });
    await page.mouse.up();
  },
);

Then(
  "Object is transformed to w: {int} and y: h: {int}",
  async (width: number, height: number) => {
    const objectTransformedGeometry = await page.evaluate(() => {
      const board = window.app.getBoard();
      const item = board.items.listAll()[0];
      const paths = item.getMbr();
      const { left, top, right, bottom } = paths;
      const itemWidth = Math.ceil(right - left);
      const itemHeight = Math.ceil(bottom - top);
      return [itemWidth, itemHeight];
    });

    expect(objectTransformedGeometry[0]).to.be.greaterThan(width);
    expect(objectTransformedGeometry[1]).to.be.greaterThan(height);
  },
);

Then("Text is transformed", async () => {
  const [width, height] = await page.evaluate(() => {
    const board = window.app.getBoard();
    const item = board.items.listAll()[0];

    const text = item.getRichText();
    return [text?.getWidth() || 0, text?.getHeight() || 0];
  });

  const { width: initialWidth, height: initialHeight } = textContainer;

  expect(Math.ceil(width)).to.be.at.least(Math.ceil(initialWidth));
  expect(Math.ceil(height)).not.to.be.equal(Math.ceil(initialHeight));
});

Then("Text isnt doubled", async () => {
  const isRenderEnabled = await page.evaluate(() => {
    const board = window.app.getBoard();
    const item = board.items.listAll()[0];

    return item.getRichText()?.isRenderEnabled;
  });

  expect(isRenderEnabled).to.be.false;
});

Then("Sticker text size is automatically detected", async () => {
  const isTextAutoSize = await page.evaluate(() => {
    const board = window.app.getBoard();
    const item = board.items.listAll()[0];
    return item.itemType === "Sticker" && item.text.isAutosize();
  });

  expect(isTextAutoSize).to.be.true;
});
