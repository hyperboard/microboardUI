import { defineFeature, loadFeature } from "jest-cucumber";
import { chromium } from "@playwright/test"; // Using Playwright for Browser Automation

const feature = loadFeature("./features/checkAppBoard.feature");

defineFeature(feature, test => {
	let page;
	let browser;

	test("User opens the site, and the app with a board is successfully loaded", ({
		given,
		then,
	}) => {
		given(/^I open the site on "(.*)"$/, async url => {
			browser = await chromium.launch();
			page = await browser.newPage();
			await page.goto(url, { waitUntil: "networkidle" });
		});

		then("the app should be loaded", async () => {
			const isAppLoaded = await page.evaluate(() => {
				return window.app && typeof window.app.getBoard === "function";
			});
			expect(isAppLoaded).toBe(true);
		});

		then("a board is opened in the app", async () => {
			const boardValidation = await page.evaluate(() => {
				const board = window.app.getBoard();
				return {
					hasGetIdMethod: typeof board.getId === "function",
					id: board.getId(),
				};
			});
			// Simple validation for UUID format, this can be improved
			const uuidRegex =
				/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
			expect(boardValidation.hasGetIdMethod).toBe(true);
			expect(boardValidation.id).toMatch(uuidRegex);
			await browser.close();
		});
	});
});
