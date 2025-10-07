import { Given, Then, When } from "@cucumber/cucumber";
import {
  DELAY,
  page,
  page2,
  SYNC_TIMEOUT,
} from "../helpers/custom-hooks.playwright.steps.ts";
import { expect } from "chai";

Given(
  "Board with two objects: object M and object N for Client A and Client B",
  async () => {
    // object N
    await page.evaluate(() => {
      const board = window.app.getBoard();
      if (!board.tools.getAddShape()) {
        board.tools.addShape();
      }
    });
    await page.mouse.click(450, 300, DELAY);

    // object M
    await page.evaluate(() => {
      const board = window.app.getBoard();
      if (!board.tools.getAddSticker()) {
        board.tools.addSticker();
      }
    });
    await page.mouse.click(300, 300, DELAY);

    await page.waitForTimeout(SYNC_TIMEOUT);
    await page2.waitForTimeout(SYNC_TIMEOUT);
  },
);

When("Client A deleted object N", async () => {
  await page.mouse.click(450, 300);
  await page.keyboard.press("Backspace", DELAY);
});

When("Client B deleted object N", async () => {
  await page2.keyboard.press("V", DELAY);

  await page2.mouse.click(450, 300);
  await page2.keyboard.press("Backspace", DELAY);
});

When("Client B connected a connector from object M to object N", async () => {
  await page2.evaluate(() => {
    const board = window.app.getBoard();
    if (!board.tools.getAddConnector()) {
      board.tools.addConnector();
    }
  });

  await page2.mouse.click(400, 300, DELAY);
  await page2.mouse.click(450, 350, DELAY);
});

When("Client A connected a connector from object M to object N", async () => {
  await page.evaluate(() => {
    const board = window.app.getBoard();
    if (!board.tools.getAddConnector()) {
      board.tools.addConnector();
    }
  });

  await page.mouse.click(400, 300, DELAY);
  await page.mouse.click(450, 350, DELAY);
});

Then("Object N is missing from the board", async () => {
  await page.waitForTimeout(SYNC_TIMEOUT);
  await page2.waitForTimeout(SYNC_TIMEOUT);

  const itemsClientA = await page.evaluate(() => {
    const board = window.app.getBoard();
    return board.items.listAll();
  });

  const itemsClientB = await page2.evaluate(() => {
    const board = window.app.getBoard();
    return board.items.listAll();
  });

  const hasNClientA = itemsClientA.some((item) => item.itemType === "Shape");
  const hasNClientB = itemsClientA.some((item) => item.itemType === "Shape");

  expect(itemsClientA.length).to.be.equal(2);
  expect(hasNClientA).to.be.false;
  expect(itemsClientB.length).to.be.equal(2);
  expect(hasNClientB).to.be.false;
});

Then(
  "Connector from object M is not connected or is floating in the air",
  async () => {
    const connector = await page.evaluate(() => {
      const board = window.app.getBoard();
      const items = board.items.listAll();
      const connector = items.find((item) => item.itemType === "Connector");

      return [
        connector?.getStartPoint().pointType,
        connector?.getEndPoint().pointType,
      ];
    });

    const connected = ["Fixed", "Board"];
    expect(connector).to.be.deep.equal(connected);
  },
);

When("Client A deleted frame", async () => {
  await page.mouse.click(300, 300, DELAY);
  await page.keyboard.press("Backspace");
});

When("Client B deleted frame", async () => {
  await page2.keyboard.press("V", DELAY);

  await page2.mouse.dblclick(300, 300, DELAY);
  await page2.mouse.click(300, 300, DELAY);
  await page2.keyboard.press("Backspace");

  await page2.waitForTimeout(SYNC_TIMEOUT);
});

When("Client B added object Z to the frame", async () => {
  await page2.evaluate(() => {
    const board = window.app.getBoard();
    if (!board.tools.getAddShape()) {
      board.tools.addShape();
    }
  });
  await page2.mouse.click(300, 300, DELAY);

  await page.waitForTimeout(SYNC_TIMEOUT);
  await page2.waitForTimeout(SYNC_TIMEOUT);
});

When("Client A added object Z to the frame", async () => {
  await page.evaluate(() => {
    const board = window.app.getBoard();
    if (!board.tools.getAddShape()) {
      board.tools.addShape();
    }
  });
  await page.mouse.click(300, 300, DELAY);

  await page.waitForTimeout(SYNC_TIMEOUT);
  await page2.waitForTimeout(SYNC_TIMEOUT);
});

Then("Frame is missing from the board", async () => {
  const frame = await page.evaluate(() => {
    const board = window.app.getBoard();
    const frame = board.items.listFrames();

    return frame.length === 0;
  });

  expect(frame).to.be.true;
});

Then("Object Z is on the board outside the frame", async () => {
  await page.waitForTimeout(SYNC_TIMEOUT);
  await page2.waitForTimeout(SYNC_TIMEOUT);

  await page.evaluate(() => {
    const board = window.app.getBoard();
    const items = board.items.listAll();

    return items;
  });
});

Given(
  "Board with text object T is with both Client A and Client B",
  async () => {
    await page.evaluate(() => {
      const board = window.app.getBoard();
      if (!board.tools.getAddText()) {
        board.tools.addText();
      }
    });
    await page.mouse.click(300, 300, DELAY);

    await page.evaluate(() => {
      const board = window.app.getBoard();
      const item = board.items.listAll()[0];
      item.getRichText()?.editor.editor.insertText("Текст");
    });

    await page.waitForTimeout(SYNC_TIMEOUT);
    await page2.waitForTimeout(SYNC_TIMEOUT);
  },
);

When("Client A deleted object", async () => {
  await page.mouse.dblclick(700, 700, DELAY);

  await page.mouse.click(300, 300, DELAY);
  await page.keyboard.press("Backspace");
});

When("Client A inserted text", async () => {
  await page.mouse.click(300, 300, DELAY);

  await page.evaluate(() => {
    const board = window.app.getBoard();
    const item = board.items.listAll()[0];

    if (
      item.itemType !== "Image" &&
      item.itemType !== "Drawing" &&
      item.itemType !== "Placeholder"
    ) {
      const richText = item.getRichText();
      richText?.editor.editor.insertText(" Текст");
    }
  });

  await page.waitForTimeout(SYNC_TIMEOUT);
  await page2.waitForTimeout(SYNC_TIMEOUT);
});

When("Client B inserted text", async () => {
  await page2.mouse.click(300, 300, DELAY);
  await page2.keyboard.press("V", DELAY);
  await page2.mouse.dblclick(300, 300, DELAY);
  await page2.mouse.click(300, 300, DELAY);

  await page2.evaluate(() => {
    const board = window.app.getBoard();
    const item = board.items.listAll()[0];

    item.getRichText()?.editor.editor.insertText(" Текст");
  });

  await page2.waitForTimeout(SYNC_TIMEOUT);
  await page.waitForTimeout(SYNC_TIMEOUT);
});

Then("Object is missing from the board", async () => {
  await page.waitForTimeout(SYNC_TIMEOUT);
  await page2.waitForTimeout(SYNC_TIMEOUT);

  const itemsClientA = await page.evaluate(() => {
    const board = window.app.getBoard();
    return board.items.listAll();
  });

  const itemsClientB = await page2.evaluate(() => {
    const board = window.app.getBoard();
    return board.items.listAll();
  });

  expect(itemsClientA.length).to.be.equal(0);
  expect(itemsClientB.length).to.be.equal(0);
});

Given("Board with object O is with both Client A and Client B", async () => {
  await page.evaluate(() => {
    const board = window.app.getBoard();
    if (!board.tools.getAddShape()) {
      board.tools.addShape();
    }
  });
  await page.mouse.click(300, 300, DELAY);

  await page2.waitForTimeout(SYNC_TIMEOUT);
  await page.waitForTimeout(SYNC_TIMEOUT);
});

When("Client B changed object", async () => {
  await page2.mouse.click(350, 350, DELAY);
  await page2.keyboard.press("V", DELAY);

  // moving objects
  await page2.mouse.move(350, 350);
  await page2.mouse.down();
  await page2.mouse.move(500, 350, { steps: 10 });
  await page2.mouse.up();
});

When("Client A changed object", async () => {
  // moving objects
  await page.mouse.move(350, 350);
  await page.mouse.down();
  await page.mouse.move(500, 350, { steps: 10 });
  await page.mouse.up();
});

When("Client B deleted object", async () => {
  await page2.mouse.click(350, 350, DELAY);
  await page2.keyboard.press("V", DELAY);

  await page2.mouse.click(300, 300, DELAY);
  await page2.keyboard.press("Backspace");
});

When("Client B undid the action", async () => {
  await page2.keyboard.press("Control+Z", DELAY);
});

When("Client A undid the action", async () => {
  await page.keyboard.press("Control+Z", DELAY);
});
