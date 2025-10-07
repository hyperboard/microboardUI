import { Page } from "playwright";
import { RawEvents } from "shared/RawEvents";

export const getText = async (page: Page): Promise<string | null> => {
  const text = await page.evaluate((): string | null => {
    const board = window.app.getBoard();
    const item = board.items.listAll()[0];
    return item.getRichText()?.getTextString() || null;
  });

  return text;
};

export const getWebSocketEvents = async (
  page: Page,
): Promise<RawEvents | never[]> => {
  return await page.evaluate(() => {
    const board = window.app.getBoard();
    return board.events?.getRaw() || [];
  });
};

export async function waitForSpecificEvent(
  page: Page,
  callback: (event: any) => boolean,
  timeout = 60000,
): Promise<void | [string, any]> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const events = await getWebSocketEvents(page);

    const foundEvent =
      events && events["confirmedEvents"].find((event: any) => callback(event));

    if (foundEvent) {
      return foundEvent;
    }

    await page.waitForTimeout(500);
  }

  throw new Error(`Event not found within ${timeout} ms`);
}
