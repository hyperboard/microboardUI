import { Given, When, Then } from "@cucumber/cucumber";
import { Connector, Frame, Shape, Drawing } from "microboard-temp";
import { expect } from "chai";
import { page } from "./helpers/custom-hooks.playwright.steps.ts";

Given("Frame added", async () => {
  await page.click("#tool-frame");
  await page.click("#frame-picker-Frame16x9");
});

Given("Connector added to x: {int}, y: {int}", async (x: number, y: number) => {
  await page.evaluate(() => {
    const board = window.app.getBoard();
    if (!board.tools.getAddConnector()) {
      board.tools.addConnector();
    }
  });
  await page.mouse.click(x, y);
});

When("User changes frame ratio", async () => {
  await page.click("#item-type");
  await page.click("#frame-picker-Frame4x3");
});

When("User changes shape stroke width", async () => {
  const borderStyleBtn = page.locator("#stroke-style");
  await borderStyleBtn.waitFor();
  await borderStyleBtn.click();

  const sliderTrack = page.locator("#shape-stroke-width").first();
  const sliderOffsetWidth = await sliderTrack.evaluate((el) => {
    return el.getBoundingClientRect().width;
  });

  // Using the hover method to place the mouse cursor then moving it to the right
  await sliderTrack.hover({ force: true, position: { x: 0, y: 0 } });
  await page.mouse.down();
  await sliderTrack.hover({
    force: true,
    position: { x: sliderOffsetWidth, y: 0 },
  });
  await page.mouse.up();
});

Then("Shape stroke width is {int}", async (expectedStrokeWidth: number) => {
  const strokeWidth = await page.evaluate(() => {
    const board = window.app.getBoard();
    const item = board.items.listAll()[0];
    return (item as Shape).getStrokeWidth();
  });
  expect(strokeWidth).to.be.equal(expectedStrokeWidth);
});

When("User clicks undo", async () => {
  const undo = page.locator("#undo");
  await undo.waitFor();
  await undo.click();
});

When("User switches connector pointers", async () => {
  const switchPointer = page.locator("#switch-pointers");
  await switchPointer.waitFor();
  await switchPointer.click();
});

Then("Connector pointers switched", async () => {
  const pointers = await page.evaluate(() => {
    const board = window.app.getBoard();
    const item = board.items.listAll()[0] as Connector;
    return [item.getStartPointerStyle(), item.getEndPointerStyle()];
  });
  expect(pointers[0]).equal("None");
  expect(pointers[1]).equal("TriangleFilled");
});

Given("Line added to x: {int}, y: {int}", async (x: number, y: number) => {
  await page.evaluate(() => {
    const board = window.app.getBoard();
    if (!board.tools.getAddDrawing()) {
      board.tools.addDrawing();
    }
  });
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + 100, y + 100, { steps: 20 });
  await page.mouse.up();
  await page.evaluate(() => {
    const board = window.app.getBoard();
    board.tools.select();
  });
  await page.mouse.click(x + 50, y + 50);
});

When("User changes line width", async () => {
  const sliderTrack = page.locator("#drawing-stroke-width").first();
  const sliderOffsetWidth = await sliderTrack.evaluate((el) => {
    return el.getBoundingClientRect().width;
  });

  // Using the hover method to place the mouse cursor then moving it to the right
  await sliderTrack.hover({ force: true, position: { x: 0, y: 0 } });
  await page.mouse.down();
  await sliderTrack.hover({
    force: true,
    position: { x: sliderOffsetWidth, y: 0 },
  });
  await page.mouse.up();
});

Then("Line width is {int}", async (expectedStrokeWidth: number) => {
  const strokeWidth = await page.evaluate(() => {
    const board = window.app.getBoard();
    const item = board.items.listAll()[0] as Drawing;
    return item.getStrokeWidth();
    return "";
  });
  expect(strokeWidth).to.be.equal(expectedStrokeWidth);
});

Then("Frame is not on the board", async () => {
  const frame = await page.evaluate(() => {
    const board = window.app.getBoard();
    return board.items.listFrames().filter((item) => item.itemType === "Frame");
  });
  expect(frame).to.be.empty;
});

Then("Frame ratio is 16x9", async () => {
  const ratio = await page.evaluate(() => {
    const board = window.app.getBoard();
    const item = board.selection.list()[0] as Frame;
    return item.getFrameType();
    return "";
  });

  expect(ratio).to.be.equal("Frame16x9");
});
