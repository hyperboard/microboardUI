import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "chai";
import { page } from "./helpers/custom-hooks.playwright.steps.ts";

When("The user clicks the templates menu button", async () => {
  await page.click("#tool-add-template");
});

Then("The templates modal is open", async () => {
  await page.waitForSelector("text=Create template", { state: "visible" });
});

When("The user chooses to use the first template", async () => {
  // Wait for templates to load
  await page.waitForSelector("img[alt]", { state: "visible" });

  // Click the Use button on the first template
  // We'll click the first instance of 'Use' button which appears on hover or click
  // The structure: image is clicked first to select
  await page.click(".imageBox img"); // selects the first template
  await page.click("text=Use");
});

Then("The template content is pasted onto the board", async () => {
  // Wait a bit for the WS/fetch to complete and paste
  await page.waitForTimeout(1000);

  const itemCount = await page.evaluate(() => {
    const board = window.app.getBoard();
    return board.items.getAllItems().length;
  });

  expect(itemCount).to.be.greaterThan(0);
});
