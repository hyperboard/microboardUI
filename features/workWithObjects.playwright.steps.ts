import { Given, Then, When } from "@cucumber/cucumber";
import {
  DELAY,
  TIMEOUT,
  getSelectedItem,
  page,
} from "./helpers/custom-hooks.playwright.steps.ts";
import { expect } from "chai";
import { Connector, Item, Shape } from "microboard-temp";

Given(
  "Shape with id: {string} added to x: {int}, y: {int}",
  async (id: string, x: number, y: number) => {
    const fontSizeBtn = page.locator("button#tool-add-shape");
    await fontSizeBtn.waitFor(TIMEOUT);
    await fontSizeBtn.click(DELAY);
    await page.waitForTimeout(2000);

    const shapeIdBtn = page
      .locator("[class*='ToolsPanel-module']")
      .locator("button#shape-" + id);
    await shapeIdBtn.waitFor(TIMEOUT);
    await shapeIdBtn.click(DELAY);

    await page.mouse.click(x, y, DELAY);
  },
);

Then("{string} is selected", async (object: string) => {
  const isSelected = await page.evaluate((object) => {
    const board = window.app.getBoard();
    return board.selection.list().some((select) => select.itemType === object);
  }, object);

  expect(isSelected).to.be.true;
});

Then("Objects is not selected", async () => {
  const selectionLength = await page.evaluate(() => {
    const board = window.app.getBoard();
    return board.selection.list().length;
  });

  expect(selectionLength).to.be.equal(0);
});

Then("Context panel is visible", async () => {
  const isContextPanelVisible = await page.locator("#ContextPanel").isVisible();
  expect(isContextPanelVisible).to.be.true;
});

Then("Context panel is not visible", async () => {
  const isContextPanelVisible = await page.locator("#ContextPanel").isVisible();
  expect(isContextPanelVisible).to.be.false;
});

Then(
  "{string} in context panel is not visible",
  async (contextPanelTool: string) => {
    const isContextPanelToolVisible = await page
      .locator("#" + contextPanelTool)
      .isVisible();
    expect(isContextPanelToolVisible).to.be.false;
  },
);

Then(
  "{string} in context panel is visible",
  async (contextPanelTool: string) => {
    const isContextPanelToolVisible = await page
      .locator("#" + contextPanelTool)
      .isVisible();
    expect(isContextPanelToolVisible).to.be.true;
  },
);

When(
  "Selecting a group start x: {int}, y: {int} and end x: {int}, y: {int}",
  async (startX: number, startY: number, endX: number, endY: number) => {
    await page.mouse.click(startX, startY);
    await page.mouse.down();
    await page.mouse.move(endX, endY, { steps: 20 });
    await page.mouse.up();
  },
);

When(
  "Moving a group of objects start x: {int}, y: {int} and end x: {int}, y: {int}",
  async (startX: number, startY: number, endX: number, endY: number) => {
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(endX, endY, { steps: 10 });
    await page.mouse.up();
  },
);

When("Click on select tool", async () => {
  const selectorBtn = page.locator("button#tool-select");
  await selectorBtn.waitFor(TIMEOUT);
  await selectorBtn.click(DELAY);
});

When("Click on zoom out", async () => {
  const zoomOut = page.locator("button#zoom-out");
  await zoomOut.waitFor(TIMEOUT);
  await zoomOut.click(DELAY);
});

When("Click on zoom in", async () => {
  const zoomOut = page.locator("button#zoom-in");
  await zoomOut.waitFor(TIMEOUT);
  await zoomOut.click(DELAY);
});

Then(
  "{string} {int} has w: {int} and y: h: {int}",
  async (
    objectType: string,
    objectNumber: number,
    width: number,
    height: number,
  ) => {
    const [itemWidth, itemHeight] = await page.evaluate(
      ([objectType, objectNumber]) => {
        const board = window.app.getBoard();
        const items = board.items
          .listAll()
          .filter((item) => item.itemType === objectType);
        const { width, height } = items[objectNumber].getPath();
        return [Math.ceil(width), Math.ceil(height)];
      },
      [objectType, objectNumber],
    );
    expect(itemWidth).to.be.equal(width);
    expect(itemHeight).to.be.equal(height);
  },
);

Then(
  "Object number {int} has coordinates x: {int} and y: {int}",
  async (objectNumber: number, expectX: number, expectY: number) => {
    const [x, y] = await page.evaluate(
      ([objectNumber]) => {
        const board = window.app.getBoard();
        const item = board.items.listAll()[objectNumber];
        const { left, top } = item.getMbr();
        return [Math.ceil(left), Math.ceil(top)];
      },
      [objectNumber],
    );

    expect(x).to.be.equal(expectX);
    expect(y).to.be.equal(expectY);
  },
);

Then("Cursor index is equal: {int}", async (expectedCursorNumber: number) => {
  await page.waitForTimeout(2000);

  const caretIndex = await page.evaluate(() => {
    const textParagraph = document.querySelector("#TextEditor");

    let position = 0;
    const isSupported = typeof window.getSelection !== "undefined";
    if (isSupported && textParagraph) {
      const selection = window.getSelection();
      if (selection?.rangeCount !== 0) {
        const range = window?.getSelection()?.getRangeAt(0);
        const preCaretRange = range?.cloneRange();
        preCaretRange?.selectNodeContents(textParagraph);
        range && preCaretRange?.setEnd(range.endContainer, range.endOffset);
        position = preCaretRange?.toString().length ?? 0;
      }
    }

    return position;
  });

  expect(caretIndex).to.be.equal(expectedCursorNumber);
});

Then("Cursor doesnt move outside object", async () => {
  let checkingCaretCoords = false;

  const caretCoords = await page.evaluate(() => {
    let x = 0;
    let y = 0;
    const isSupported = typeof window.getSelection !== "undefined";
    if (isSupported) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount !== 0) {
        const range = selection.getRangeAt(0);
        range.collapse(true);
        const rect = range.getClientRects()[0];
        if (rect) {
          x = rect.x;
          y = rect.y;
        }
      }
    }

    return { x, y };
  });

  const textEditorCoords = await page.evaluate(() => {
    const textEditor = document.querySelector('[data-slate-node="element"]');

    if (textEditor) {
      return textEditor.getClientRects()[0];
    }

    return null;
  });

  if (textEditorCoords) {
    const { left, top, bottom, right } = textEditorCoords;
    const { x, y } = caretCoords;

    checkingCaretCoords = left <= x && top <= y && bottom >= y && right >= x;
  }

  expect(checkingCaretCoords).to.be.true;
});

Then(
  "Object number {int} has background color: {string}",
  async (objectNumber: number, expectedBackgroundColor: string) => {
    const backgroundColor = await page.evaluate((objectNumber) => {
      const board = window.app.getBoard();
      const item = board.items.listAll()[objectNumber];
      const frameItem = board.items.listFrames()[objectNumber];
      if (item.itemType === "Sticker" || item.itemType === "Shape") {
        return item.getBackgroundColor();
      }

      if (frameItem.itemType === "Frame") {
        frameItem.getBackgroundColor();
      }

      return "none";
    }, objectNumber);

    expect(backgroundColor).to.be.equal(expectedBackgroundColor);
  },
);

Then(
  "Object number {int} has shape type {string}",
  async (objectNumber: number, expectedShapeType: string) => {
    const shapeType = await page.evaluate((objectNumber) => {
      const board = window.app.getBoard();
      const item = board.items.listAll()[objectNumber];

      if (item.itemType === "Shape") {
        return item.getShapeType();
      }

      return null;
    }, objectNumber);

    expect(shapeType).to.be.equal(expectedShapeType);
  },
);

Then(
  "Object number {int} has stroke width {int}",
  async (objectNumber: number, expectedStrokeWidth: number) => {
    const strokeWidth = await page.evaluate((objectNumber) => {
      const board = window.app.getBoard();
      const item = board.items.listAll()[objectNumber];

      if (item.itemType === "Shape" || item.itemType === "Drawing") {
        return item.getStrokeWidth();
      }

      return null;
    }, objectNumber);

    expect(strokeWidth).to.be.equal(expectedStrokeWidth);
  },
);

Then(
  "Connector number {int} was duplicated to start point x: {int}, y: {int} and end point x: {int}, y: {int}",
  async (
    objectNumber: number,
    expectedStartX: number,
    expectedStartY: number,
    expectedEndX: number,
    expectedEndY: number,
  ) => {
    const [startPoint, endPoint] = await page.evaluate((objectNumber) => {
      const board = window.app.getBoard();
      const item = board.items.listAll()[objectNumber] as Connector;
      return [item.getStartPoint(), item.getEndPoint()];
    }, objectNumber);
    const { x: startX, y: startY } = startPoint;
    const { x: endX, y: endY } = endPoint;
    expect(Math.ceil(startX)).to.equal(expectedStartX);
    expect(Math.ceil(startY)).to.equal(expectedStartY);
    expect(Math.ceil(endX)).to.equal(expectedEndX);
    expect(Math.ceil(endY)).to.equal(expectedEndY);
  },
);

export const getBackgroundColorId = (
  item: Item,
  backgroundColor: string,
): string => {
  if (item.itemType === "Sticker") {
    return `//button[@id="sticker-fillrgb(${backgroundColor})"]`;
  }
  return `//button[@id="fill-stylergb(${backgroundColor})"]`;
};

Given(
  "User changed background color: {string}",
  async (backgroundColor: string) => {
    const item = await getSelectedItem();

    const backgroundPickerId =
      item.itemType === "Sticker"
        ? "button#sticker-fill-style"
        : "button#fill-style";

    const backgroundPicker = page.locator(backgroundPickerId);
    await backgroundPicker.waitFor(TIMEOUT);
    await backgroundPicker.click(DELAY);

    const backgroundColorBtnId = getBackgroundColorId(item, backgroundColor);
    const backgroundColorBtn = page.locator(backgroundColorBtnId);
    await backgroundColorBtn.waitFor(TIMEOUT);
    await backgroundColorBtn.click(DELAY);
  },
);

Given(
  "User changed stroke width: {int} of shape",
  async (strokeWidth: number) => {
    await page.evaluate((strokeWidth) => {
      const board = window.app.getBoard();
      const item = board.selection.list()[0];
      (item as Shape).setBorderWidth(strokeWidth);
    }, strokeWidth);
  },
);
