import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "chai";
import { page } from "./helpers/custom-hooks.playwright.steps.ts";

Given("The user navigates to {string}", async (url: string) => {
  await page.goto(url);
  await page.waitForURL(/.*\/boards\/.*/g);
});

When("The app is fully loaded", async () => {
  await page.waitForFunction(() => window.app !== undefined);
});

Then("A board is opened within the app", async () => {
  const isGetBoardFunction = await page.evaluate(() => {
    return typeof window.app.getBoard === "function";
  });
  const boardId = await page.evaluate(() => {
    const board = window.app.getBoard();
    return board.getBoardId();
  });
  expect(isGetBoardFunction).to.be.ok;
  expect(boardId).to.be.not.equal("blank");
});
