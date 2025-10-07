import { Given, Then, When } from "@cucumber/cucumber";
import {
  DELAY,
  page,
  page2,
  SYNC_TIMEOUT,
} from "../helpers/custom-hooks.playwright.steps.ts";
import { getText } from "./syncHelpers.ts";
import { expect } from "chai";

Given(
  "Board with {int} paragraphs of text for Client A and Client B",
  async (paragraphs: number) => {
    await page.evaluate(() => {
      const board = window.app.getBoard();
      if (!board.tools.getAddText()) {
        board.tools.addText();
      }
    });
    await page.mouse.click(300, 300);

    await page.evaluate((paragraphs) => {
      const board = window.app.getBoard();
      const item = board.items.listAll()[0];

      if (
        item.itemType !== "Image" &&
        item.itemType !== "Drawing" &&
        item.itemType !== "Placeholder"
      ) {
        const richText = item.getRichText();

        richText?.editor.editor.insertText(`Параграф 1`);
        for (let i = 1; i < paragraphs; i++) {
          if (!richText) {
            return;
          }
          richText.editor.editor.insertNode({
            type: "paragraph",
            children: [
              {
                text: `Параграф ${i + 1}`,
                type: "text",
                bold: false,
                italic: false,
                underline: false,
                overline: false,
                lineThrough: false,
                subscript: false,
                superscript: false,
              },
            ],
          });
        }
      }
    }, paragraphs);

    await page.waitForTimeout(SYNC_TIMEOUT);
  },
);

When(
  "Client A delete paragraph first paragraph {string}",
  async (paragraph: string) => {
    await page.waitForTimeout(SYNC_TIMEOUT);
    await page.mouse.click(300, 300, { delay: 100 });
    await page.mouse.click(300, 300, { delay: 100 });

    await page.keyboard.down("Shift");
    for (let i = 0; i < paragraph.length; i++) {
      await page.keyboard.press("ArrowRight", { delay: 100 });
    }
    await page.keyboard.up("Shift");
    await page.waitForTimeout(SYNC_TIMEOUT);

    await page.keyboard.press("Backspace");
  },
);

When(
  "Client B delete paragraph first paragraph {string}",
  async (paragraph: string) => {
    await page2.keyboard.press("V", DELAY);
    await page2.mouse.dblclick(300, 300, { delay: 100 });
    await page2.mouse.click(300, 300, { delay: 100 });

    await page2.keyboard.down("Shift");
    for (let i = 0; i < paragraph.length; i++) {
      await page2.keyboard.press("ArrowRight", { delay: 100 });
    }
    await page2.keyboard.up("Shift");
    await page2.waitForTimeout(SYNC_TIMEOUT);

    await page2.keyboard.press("Backspace");
  },
);

When(
  "Client A delete paragraph last paragraph {string} in {string}",
  async (paragraph: string, text: string) => {
    await page.waitForTimeout(SYNC_TIMEOUT);
    await page.mouse.click(300, 300, { delay: 100 });
    await page.mouse.click(300, 300, { delay: 100 });

    for (let i = 0; i < text.length; i++) {
      await page.keyboard.press("ArrowRight", { delay: 100 });
    }

    await page.keyboard.down("Shift");
    for (let i = 0; i < (paragraph + "  ").length; i++) {
      await page.keyboard.press("ArrowRight", { delay: 100 });
    }
    await page.keyboard.up("Shift");
    await page.waitForTimeout(SYNC_TIMEOUT);

    await page.keyboard.press("Backspace");
  },
);

When(
  "Client B delete paragraph last paragraph {string} in {string}",
  async (paragraph: string, text: string) => {
    await page2.waitForTimeout(SYNC_TIMEOUT);
    await page2.keyboard.press("V", DELAY);
    await page2.mouse.dblclick(300, 300, { delay: 100 });

    await page2.mouse.click(300, 300, { delay: 100 });

    for (let i = 0; i < text.length; i++) {
      await page2.keyboard.press("ArrowRight", { delay: 100 });
    }

    await page2.keyboard.down("Shift");
    for (let i = 0; i < (paragraph + "  ").length; i++) {
      await page2.keyboard.press("ArrowRight", { delay: 100 });
    }
    await page2.keyboard.up("Shift");
    await page2.waitForTimeout(SYNC_TIMEOUT);

    await page2.keyboard.press("Backspace");
  },
);

When("Client B add new paragraph after {string}", async (text: string) => {
  await page2.waitForTimeout(SYNC_TIMEOUT);
  await page2.mouse.dblclick(300, 300, { delay: 100 });
  await page2.mouse.dblclick(300, 300, { delay: 100 });
  await page2.mouse.click(300, 300, { delay: 100 });

  for (let i = 0; i < text.length; i++) {
    await page2.keyboard.press("ArrowRight", { delay: 100 });
  }

  await page2.keyboard.press("Enter", { delay: 100 });
  await page2.keyboard.insertText("Новый параграф");
});

When("Client A add new paragraph after {string}", async (text: string) => {
  await page.waitForTimeout(SYNC_TIMEOUT);
  await page.mouse.dblclick(300, 300, { delay: 100 });
  await page.mouse.dblclick(300, 300, { delay: 100 });
  await page.mouse.click(300, 300, { delay: 100 });

  for (let i = 0; i < text.length; i++) {
    await page.keyboard.press("ArrowRight", { delay: 100 });
  }

  await page.keyboard.press("Enter", { delay: 100 });
  await page.keyboard.insertText("Новый параграф");
});

When(
  "Client A added new paragraph {string} after {string}",
  async (newParagraph: string, paragraphAfter: string) => {
    await page.waitForTimeout(SYNC_TIMEOUT);
    await page.mouse.click(300, 300, { delay: 100 });
    await page.mouse.click(300, 300, { delay: 100 });

    for (let i = 0; i < paragraphAfter.length; i++) {
      await page.keyboard.press("ArrowRight", { delay: 100 });
    }

    await page.keyboard.press("Enter");
    await page.keyboard.insertText(newParagraph);
  },
);

When(
  "Client B added new paragraph {string} after {string}",
  async (newParagraph: string, paragraphAfter: string) => {
    await page2.waitForTimeout(SYNC_TIMEOUT);
    await page2.keyboard.press("V", DELAY);
    await page2.mouse.dblclick(300, 300, { delay: 100 });
    await page2.mouse.click(300, 300, { delay: 100 });

    for (let i = 0; i < paragraphAfter.length; i++) {
      await page2.keyboard.press("ArrowRight", { delay: 100 });
    }

    await page2.keyboard.press("Enter");
    await page2.keyboard.insertText(newParagraph);
  },
);

When(
  "Client A merged the first two paragraphs into a single paragraph",
  async () => {
    await page.waitForTimeout(SYNC_TIMEOUT);
    await page.mouse.click(300, 300, { delay: 100 });
    await page.mouse.click(300, 300, { delay: 100 });

    for (let i = 0; i < "Параграф 1 ".length; i++) {
      await page.keyboard.press("ArrowRight", { delay: 100 });
    }

    await page.keyboard.press("Backspace");
  },
);

When(
  "Client B merged the first two paragraphs into a single paragraph",
  async () => {
    await page2.waitForTimeout(SYNC_TIMEOUT);
    await page2.keyboard.press("V", DELAY);
    await page2.mouse.dblclick(300, 300, { delay: 100 });
    await page2.mouse.click(300, 300, { delay: 100 });

    for (let i = 0; i < "Параграф 1 ".length; i++) {
      await page2.keyboard.press("ArrowRight", { delay: 100 });
    }

    await page2.keyboard.press("Backspace");
  },
);

Given(
  "Board with long paragraphs of text for Client A and Client B",
  async () => {
    await page.evaluate(() => {
      const board = window.app.getBoard();
      if (!board.tools.getAddText()) {
        board.tools.addText();
      }
    });
    await page.mouse.click(300, 300);

    await page.evaluate(() => {
      const board = window.app.getBoard();
      const item = board.items.listAll()[0];

      if (
        item.itemType !== "Image" &&
        item.itemType !== "Drawing" &&
        item.itemType !== "Placeholder"
      ) {
        item
          .getRichText()
          ?.editor.editor.insertText("Это длинный параграф текста");
      }
    });

    await page.waitForTimeout(SYNC_TIMEOUT);
  },
);

When(
  "Client A splits the paragraph into two after the word {string}",
  async (text: string) => {
    await page.mouse.click(300, 300, { delay: 100 });
    await page.mouse.click(300, 300, { delay: 100 });

    for (let i = 0; i < text.length; i++) {
      await page.keyboard.press("ArrowRight", { delay: 100 });
    }

    await page.keyboard.press("Enter");
  },
);

When(
  "Client B splits the paragraph into two after the word {string}",
  async (text: string) => {
    await page2.keyboard.press("V", DELAY);
    await page2.mouse.dblclick(300, 300, { delay: 100 });
    await page2.mouse.click(300, 300, { delay: 100 });

    for (let i = 0; i < text.length; i++) {
      await page2.keyboard.press("ArrowRight", { delay: 100 });
    }

    await page2.keyboard.press("Enter");
  },
);

Then(
  "The paragraph text on both clients is: {string}",
  async (expectText: string) => {
    const textA = await getText(page);
    const textB = await getText(page2);

    expect(textA?.replace(/(\r\n|\n|\r)/gm, " ")).to.be.equal(expectText);
    expect(textB?.replace(/(\r\n|\n|\r)/gm, " ")).to.be.equal(expectText);
  },
);
