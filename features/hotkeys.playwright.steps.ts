import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "chai";
import { DELAY, page } from "./helpers/custom-hooks.playwright.steps.ts";

When("The user presses the {string} key", async (key: string) => {
  await page.keyboard.press(key, DELAY);
});

When("The user presses the {string} key twice", async (key: string) => {
  await page.keyboard.press(key, DELAY);
  await page.keyboard.press(key, DELAY);
});

Given("The board is initialized", async () => {
  await page.goto("http://api_dev:8000");
  await page.waitForURL(/.*\/boards\/.*/g);
});

Given("The board is zooming out", async () => {
  await page.evaluate(() => {
    const board = window.app.getBoard();
    board.camera.zoomOutFromViewCenter();
  });
});

Given("Export enabled", async () => {
  await page.evaluate(() => {
    const board = window.app.getBoard();
    board.tools.export();
  });
});

Given("Sticker added to x: {int}, y: {int}", async (x: number, y: number) => {
  await page.evaluate(() => {
    const board = window.app.getBoard();
    if (!board.tools.getAddSticker()) {
      board.tools.addSticker();
    }
  });
  await page.mouse.click(x, y, DELAY);
});

Given("Shape added to x: {int}, y: {int}", async (x: number, y: number) => {
  await page.evaluate(() => {
    const board = window.app.getBoard();
    if (!board.tools.getAddShape()) {
      board.tools.addShape();
    }
  });
  await page.mouse.click(x, y, DELAY);
});

Given("Cursor clicked at x: {int}, y: {int}", async (x: number, y: number) => {
  await page.mouse.click(x, y, DELAY);
});

Given(
  "Cursor clicked at x: {int}, y: {int} twice",
  async (x: number, y: number) => {
    await page.mouse.dblclick(x, y, DELAY);
  },
);

Given("User typed the text: {string}", async (text: string) => {
  await page.waitForTimeout(100);
  await page.keyboard.type(text, DELAY);
});

When("User clicks to x: {int}, y: {int}", async (x: number, y: number) => {
  await page.mouse.click(x, y);
});

Then("{string} tool is selected", async (tool: string) => {
  const isToolSelected = await page.evaluate((tool: string) => {
    const board = window.app.getBoard();
    if (tool === "Select") return board.tools.getSelect();
    if (tool === "AddShape") return board.tools.getAddShape();
    if (tool === "AddText") return board.tools.getAddText();
    if (tool === "AddConnector") return board.tools.getAddConnector();
    if (tool === "AddSticker") return board.tools.getAddSticker();
    if (tool === "AddDrawing") return board.tools.getAddDrawing();
    if (tool === "AddFrame") return board.tools.getAddFrame();
    return null;
  }, tool);

  expect(isToolSelected).to.be.ok;
});

Then("The board is zoomed in", async () => {
  const zoom = await page.evaluate(() => {
    const board = window.app.getBoard();
    return board.camera.getScale();
  });
  expect(zoom).to.be.greaterThan(1);
});

Then("The board is zoomed out", async () => {
  const zoom = await page.evaluate(() => {
    const board = window.app.getBoard();
    return board.camera.getScale();
  });
  expect(zoom).to.be.lessThan(1);
});

Then("The board is zoomed default", async () => {
  const zoom = await page.evaluate(() => {
    const board = window.app.getBoard();
    return board.camera.getScale();
  });
  expect(zoom).to.be.equal(1);
});

Then("Selected item duplicated", async () => {
  const items = await page.evaluate(() => {
    const board = window.app.getBoard();

    return board.items.listAll();
  });

  expect(items).to.be.lengthOf(2);
  expect(items[0].itemType).to.be.equal(items[1].itemType);
});

Then("{int} items are selected", async (expectedSelectionCount: number) => {
  const selectionItems = await page.evaluate(() => {
    const board = window.app.getBoard();
    return board.selection.list();
  });

  expect(selectionItems.length).to.be.equal(expectedSelectionCount);
});

Then("Export canceled", async () => {
  const isExporting = await page.evaluate(() => {
    const board = window.app.getBoard();
    return Boolean(board.tools.getExport());
  });

  expect(isExporting).to.be.false;
});

Then("{int} items on the board", async (expectedItemsCount: number) => {
  const items = await page.evaluate(() => {
    const board = window.app.getBoard();
    return board.items.listAll();
  });

  expect(items).to.be.lengthOf(expectedItemsCount);
});

Then("Selected item has zIndex {int}", async (expectedZIndex: number) => {
  const [selectedItem, expectedItem] = await page.evaluate((expectedZIndex) => {
    const board = window.app.getBoard();
    const item = board.getByZIndex(expectedZIndex);
    const selectedItem = board.selection.list()[0];
    return [selectedItem, item] as const;
  }, expectedZIndex);

  expect(selectedItem).to.be.equal(expectedItem);
});

Then("Text is textStyle: {string}", async (textStyle: string) => {
  const isFindTextStyle = await page.evaluate((textStyle: string) => {
    const board = window.app.getBoard();
    const item = board.items.listAll()[0];

    if (
      item.itemType !== "Image" &&
      item.itemType !== "Drawing" &&
      item.itemType !== "RichText" &&
      item.itemType !== "Placeholder"
    ) {
      if (textStyle === "bold") {
        return item.getRichText()?.getFontStyles().includes("bold");
      }
      if (textStyle === "strike") {
        return item.getRichText()?.getFontStyles().includes("line-through");
      }
      if (textStyle === "underline") {
        return item.getRichText()?.getFontStyles().includes("underline");
      }
      if (textStyle === "italic") {
        return item.getRichText()?.getFontStyles().includes("italic");
      }
    }

    return null;
  }, textStyle);

  expect(isFindTextStyle).to.be.ok;
});
