import { Given, Then, When } from "@cucumber/cucumber";
import {
  DELAY,
  page,
  page2,
  SYNC_TIMEOUT,
} from "../helpers/custom-hooks.playwright.steps.ts";
import { expect } from "chai";
import { Page } from "playwright";

const getPositions = async (
  page: Page,
): Promise<{ x: number; y: number }[]> => {
  return await page.evaluate(() => {
    const board = window.app.getBoard();
    const items = board.items.listAll();
    const frameItems = board.items.listFrames();

    return [...items, ...frameItems].map((item) => {
      const { left, top } = item.getMbr();
      return { x: Math.ceil(left), y: Math.ceil(top) };
    });
  });
};

Given("Board with multiple items for Client A and Client B", async () => {
  // add sticker
  await page.evaluate(() => {
    const board = window.app.getBoard();
    if (!board.tools.getAddSticker()) {
      board.tools.addSticker();
    }
  });
  await page.mouse.click(300, 300, DELAY);

  // add shape
  await page.evaluate(() => {
    const board = window.app.getBoard();
    if (!board.tools.getAddShape()) {
      board.tools.addShape();
    }
  });
  await page.mouse.click(450, 300, DELAY);

  // add connector
  await page.evaluate(() => {
    const board = window.app.getBoard();
    board.tools.addConnector();
  });

  await page.mouse.click(600, 350, DELAY);
  await page.mouse.click(700, 350, DELAY);

  await page.waitForTimeout(SYNC_TIMEOUT);
  await page2.waitForTimeout(SYNC_TIMEOUT);
});

When(
  "Client A selected the first two objects and moved them together",
  async () => {
    // select objects
    await page.mouse.click(150, 150);
    await page.mouse.down();
    await page.mouse.move(590, 550, { steps: 10 });
    await page.mouse.up();

    // moving objects
    await page.mouse.move(300, 300);
    await page.mouse.down();
    await page.mouse.move(300, 500, { steps: 10 });
    await page.mouse.up();
  },
);

When(
  "Client B selected the first two objects and moved them together",
  async () => {
    await page2.keyboard.press("V", DELAY);

    // select objects
    await page2.mouse.click(150, 150);
    await page2.mouse.down();
    await page2.mouse.move(590, 550, { steps: 10 });
    await page2.mouse.up();

    // moving objects
    await page2.mouse.move(300, 300);
    await page2.mouse.down();
    await page2.mouse.move(300, 500, { steps: 10 });
    await page2.mouse.up();
  },
);

When("Client B moved second object", async () => {
  await page2.mouse.click(500, 350, { delay: 100 });
  await page2.keyboard.press("V", DELAY);

  // moving objects
  await page2.mouse.move(500, 350);
  await page2.mouse.down();
  await page2.mouse.move(500, 250, { steps: 10 });
  await page2.mouse.up();
});

When("Client A moved second object", async () => {
  await page.mouse.click(700, 700);

  // moving objects
  await page.mouse.move(500, 350);
  await page.mouse.down();
  await page.mouse.move(500, 250, { steps: 10 });
  await page.mouse.up();
});

Then("Positions of the objects are the same on both clients", async () => {
  await page.waitForTimeout(SYNC_TIMEOUT);
  await page2.waitForTimeout(SYNC_TIMEOUT);

  const actualPositionsClientA = await getPositions(page);
  const actualPositionsClientB = await getPositions(page2);

  expect(actualPositionsClientA).to.deep.equal(actualPositionsClientB);
});

Then(
  "Objects A and B are in their final positions, accounting for the movements made by both clients",
  async () => {
    const actualPositionsClientA = await getPositions(page);
    const actualPositionsClientB = await getPositions(page2);

    const expectedPositions = [
      { x: 200, y: 400 },
      { x: 450, y: 400 },
      { x: 601, y: 342 },
    ];

    expect(actualPositionsClientA).to.deep.equal(expectedPositions);
    expect(actualPositionsClientB).to.deep.equal(expectedPositions);
  },
);

Given(
  "Board with frame containing an object for Client A and Client B",
  async () => {
    // add frame
    await page.evaluate(() => {
      const board = window.app.getBoard();
      if (!board.tools.getAddFrame()) {
        board.tools.addFrame();
      }
    });
    await page.mouse.click(300, 300, DELAY);

    // add shape
    await page.evaluate(() => {
      const board = window.app.getBoard();
      if (!board.tools.getAddShape()) {
        board.tools.addShape();
      }
    });
    await page.mouse.click(300, 300, DELAY);

    await page.waitForTimeout(SYNC_TIMEOUT);
    await page2.waitForTimeout(SYNC_TIMEOUT);
  },
);

When("Client A moved the frame to different location", async () => {
  // select frame
  await page.mouse.dblclick(150, 150);

  // moving objects
  await page.mouse.down();
  await page.mouse.move(500, 150, { steps: 10 });
  await page.mouse.up();
});

When("Client B moved the frame to different location", async () => {
  await page2.mouse.click(500, 350, { delay: 100 });
  await page2.keyboard.press("V", DELAY);

  // select frame
  await page.mouse.dblclick(150, 150);

  // moving objects
  await page.mouse.down();
  await page.mouse.move(500, 150, { steps: 10 });
  await page.mouse.up();
});

When("Client B moved object within frame", async () => {
  await page2.mouse.click(500, 350, { delay: 100 });
  await page2.keyboard.press("V", DELAY);

  // moving objects
  await page2.mouse.move(300, 300);
  await page2.mouse.down();
  await page2.mouse.move(300, 100, { steps: 10 });
  await page2.mouse.up();
});

When("Client A moved object within frame", async () => {
  // moving objects
  await page.mouse.move(300, 300);
  await page.mouse.down();
  await page.mouse.move(300, 100, { steps: 10 });
  await page.mouse.up();
});

Then(
  "Object is within the frame, accounting for the movements made by both clients",
  async () => {
    await page.waitForTimeout(SYNC_TIMEOUT);
    await page2.waitForTimeout(SYNC_TIMEOUT);

    const actualPositionsClientA = await page.evaluate(() => {
      const board = window.app.getBoard();
      const items = board.items.listAll();
      const frameItems = board.items.listFrames();

      const frameCenterPosition = frameItems[0]?.getMbr().getCenter();
      const shapeCenterPosition = items[0]?.getMbr().getCenter();

      if (frameCenterPosition && shapeCenterPosition) {
        return (
          frameCenterPosition?.x < shapeCenterPosition?.x &&
          frameCenterPosition?.y > shapeCenterPosition?.y
        );
      }

      return null;
    });

    const actualPositionsClientB = await page2.evaluate(() => {
      const board = window.app.getBoard();
      const items = board.items.listAll();
      const frameItems = board.items.listFrames();

      const frameCenterPosition = frameItems[0]?.getMbr().getCenter();
      const shapeCenterPosition = items[0]?.getMbr().getCenter();

      if (frameCenterPosition && shapeCenterPosition) {
        return (
          frameCenterPosition?.x < shapeCenterPosition?.x &&
          frameCenterPosition?.y > shapeCenterPosition?.y
        );
      }

      return null;
    });

    expect(actualPositionsClientA).to.be.true;
    expect(actualPositionsClientB).to.be.true;
  },
);

Then(
  "Positions of the frame and object are the same on both clients",
  async () => {
    const actualPositionsClientA = await getPositions(page);
    const actualPositionsClientB = await getPositions(page);

    expect(actualPositionsClientA).to.deep.equal(actualPositionsClientB);
  },
);

Given("Board with frame for Client A and Client B", async () => {
  await page.evaluate(() => {
    const board = window.app.getBoard();
    if (!board.tools.getAddFrame()) {
      board.tools.addFrame();
    }
  });
  await page.mouse.click(300, 300, DELAY);

  await page.waitForTimeout(SYNC_TIMEOUT);
  await page2.waitForTimeout(SYNC_TIMEOUT);
});

When(
  "Client B added new object to the previous location of the frame",
  async () => {
    await page2.evaluate(() => {
      const board = window.app.getBoard();
      if (!board.tools.getAddShape()) {
        board.tools.addShape();
      }
    });
    await page2.mouse.click(100, 300, DELAY);
  },
);

When(
  "Client A added new object to the previous location of the frame",
  async () => {
    await page.evaluate(() => {
      const board = window.app.getBoard();
      if (!board.tools.getAddShape()) {
        board.tools.addShape();
      }
    });
    await page.mouse.click(100, 300, DELAY);
  },
);

Then("Object is on the board outside the frame", async () => {
  await page.waitForTimeout(SYNC_TIMEOUT);
  await page2.waitForTimeout(SYNC_TIMEOUT);

  const actualPositionsClientA = await page.evaluate(() => {
    const board = window.app.getBoard();
    const items = board.items.listAll();
    const frameItems = board.items.listFrames();

    const frameCenterPosition = frameItems[0]?.getMbr().getCenter();
    const shapeCenterPosition = items[0]?.getMbr().getCenter();

    if (frameCenterPosition && shapeCenterPosition) {
      return (
        frameCenterPosition?.x > shapeCenterPosition?.x &&
        frameCenterPosition?.y < shapeCenterPosition?.y
      );
    }

    return null;
  });

  const actualPositionsClientB = await page2.evaluate(() => {
    const board = window.app.getBoard();
    const items = board.items.listAll();
    const frameItems = board.items.listFrames();

    const frameCenterPosition = frameItems[0]?.getMbr().getCenter();
    const shapeCenterPosition = items[0]?.getMbr().getCenter();

    if (frameCenterPosition && shapeCenterPosition) {
      return (
        frameCenterPosition?.x > shapeCenterPosition?.x &&
        frameCenterPosition?.y < shapeCenterPosition?.y
      );
    }

    return null;
  });

  expect(actualPositionsClientA).to.be.true;
  expect(actualPositionsClientB).to.be.true;
});
