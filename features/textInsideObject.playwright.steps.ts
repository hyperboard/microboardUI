import { Then, When, Given } from "@cucumber/cucumber";
import {
  DELAY,
  TIMEOUT,
  page,
} from "./helpers/custom-hooks.playwright.steps.ts";
import { expect } from "chai";

Given("Text {string} added to object", async (text: string) => {
  await page.evaluate((text) => {
    const board = window.app.getBoard();
    const item = board.items.listAll()[0];

    const richText = item.getRichText();
    richText?.editor.editor.insertText(text);
    richText?.editor.moveCursorToEndOfTheText();
  }, text);
});

When("Move cursor to end", async () => {
  await page.evaluate(() => {
    const board = window.app.getBoard();
    const item = board.items.listAll()[0];

    const richText = item.getRichText();
    richText?.editor.moveCursorToEndOfTheText();
  });
});

Given(
  "Text {string} added to object number {int}",
  async (text: string, objectNumber: number) => {
    await page.evaluate(
      ([text, objectNumber]) => {
        const board = window.app.getBoard();
        const item = board.items.listAll()[objectNumber];

        const richText = item.getRichText();
        richText.editor.editor.insertText(text);
      },
      [text, objectNumber],
    );
  },
);

Given(
  "Connector added to x: {int}, y: {int} and x: {int}, y: {int}",
  async (x1: number, y1: number, x2: number, y2: number) => {
    await page.evaluate(() => {
      const board = window.app.getBoard();
      board.tools.addConnector();
    });

    await page.mouse.click(x1, y1, DELAY);
    await page.mouse.click(x2, y2, DELAY);
  },
);

When("Reload page", async () => {
  await page.reload();
  await page.waitForURL(/.*\/boards\/.*/g);
  await page.waitForFunction(() => window.app !== undefined);
  await page.waitForTimeout(4000);
});

When("Clicked at zoomToFit", async () => {
  const zoomToFitBtn = page.locator("#zoom-to-fit");
  await zoomToFitBtn.waitFor(TIMEOUT);
  await zoomToFitBtn.click(DELAY);
});

Then("Text hasnt an error {string}", async (error: string) => {
  const textEditorInnerText = await page.evaluate(() => {
    const textEditor = document.getElementById("TextEditor");
    return textEditor ? textEditor.innerText : null;
  });

  expect(textEditorInnerText).to.not.equal(error);
});

const getFontSizeBtnId = (): string => {
  return "FontSizeChevron";
};

When("User changed text size by clicking on top arrow", async () => {
  const fontSizeBtnId: string = getFontSizeBtnId();
  const [x, y] = await page.evaluate((fontSizeBtnId) => {
    const fontSizeBtn = document.getElementById(fontSizeBtnId);
    const fontSizeChevron = fontSizeBtn?.getElementsByTagName("use")[0];

    if (fontSizeChevron) {
      const { top, left } = fontSizeChevron.getBoundingClientRect();
      return [left + 5, top - 2];
    }

    return [null, null];
  }, fontSizeBtnId);

  if (x && y) {
    await page.mouse.click(x, y, DELAY);
  }
});

When("User changed text size by clicking on down arrow", async () => {
  const fontSizeBtnId: string = getFontSizeBtnId();
  const [x, y] = await page.evaluate((fontSizeBtnId) => {
    const fontBtn = document.getElementById(fontSizeBtnId);

    if (fontBtn) {
      const { bottom, left } = fontBtn.getBoundingClientRect();
      return [left + 4, bottom - 4];
    }

    return [null, null];
  }, fontSizeBtnId);

  if (x && y) {
    await page.mouse.click(x, y, DELAY);
  }
});

When("User duplicate object", async () => {
  await page.locator("#duplicate").click();
});

When(
  "User changed text size by clicking on panel dropdown {int} font size",
  async (fontSize: number) => {
    const fontSizeBtnId = "pick-font-size";
    const pickFontSize = page.locator("div#" + fontSizeBtnId);
    await pickFontSize.waitFor(TIMEOUT);
    await pickFontSize.click(DELAY);

    const fontSizeDropdown = "FontSize";
    const fontSizeBtn = page.locator("#" + fontSizeDropdown + fontSize);
    await fontSizeBtn.waitFor(TIMEOUT);
    await fontSizeBtn.click(DELAY);
  },
);

When(
  "User changed text size by typing {string} font size",
  async (fontSize: string) => {
    const pickFontSize = page.locator("div#pick-font-size");
    await pickFontSize.waitFor(TIMEOUT);
    await pickFontSize.click(DELAY);
    await page.waitForTimeout(2000);

    await page.keyboard.type(fontSize);
  },
);

When(
  "User changed text alignment on {string}",
  async (textAlignment: string) => {
    const pickChangeTextAlignment = page.locator("button#ChangeTextAlignment");
    await pickChangeTextAlignment.waitFor(TIMEOUT);
    await pickChangeTextAlignment.click(DELAY);

    const changeTextAlignment = page.locator("button#Change" + textAlignment);
    await changeTextAlignment.waitFor(TIMEOUT);
    await changeTextAlignment.click(DELAY);
  },
);

const getTalkTextAlignmentBtnId = (): string => {
  return "text-alignment";
};

When(
  "User changed text alignment {string} on {string}",
  async (textAlignmentDirection: string, textAlignment: string) => {
    const textAlignmentBtnId = getTalkTextAlignmentBtnId();
    const pickChangeTextAlignment = page.locator(
      "button#" + textAlignmentBtnId,
    );
    await pickChangeTextAlignment.waitFor(TIMEOUT);
    await pickChangeTextAlignment.click(DELAY);

    const textAlignmentPickBtnId =
      textAlignmentDirection.toLowerCase() + "-alignment-";
    const changeTextAlignment = page.locator(
      "button#" + textAlignmentPickBtnId + textAlignment,
    );
    await changeTextAlignment.waitFor(TIMEOUT);
    await changeTextAlignment.click(DELAY);
  },
);

When("User changed text style on {string}", async (textStyle: string) => {
  const pickChangeFontStyleId = "button#ChangeFontStyle";

  const pickChangeFontStyle = page.locator(pickChangeFontStyleId);
  await pickChangeFontStyle.waitFor(TIMEOUT);
  await pickChangeFontStyle.click(DELAY);

  const pickerFontStyleId = "button#ChangeFont" + textStyle;

  const pickerFontStyle = page.locator(pickerFontStyleId);
  await pickerFontStyle.waitFor(TIMEOUT);
  await pickerFontStyle.click(DELAY);
});

When(
  "User changed text style on {string} by app",
  async (textStyle: string) => {
    await page.evaluate(
      (textStyle) => {
        const board = window.app.getBoard();
        const item = board.selection.list()[0];

        const richText = item.getRichText();
        richText?.setSelectionFontStyle(textStyle);
      },
      [textStyle],
    );
  },
);

When("User changed text size on {int} by app", async (textSize: number) => {
  await page.evaluate((textSize) => {
    const board = window.app.getBoard();
    const item = board.selection.list()[0];

    const richText = item.getRichText();
    richText?.setSelectionFontSize(textSize);
  }, textSize);
});

When(
  "User changed text color on {string} by app",
  async (textColor: string) => {
    await page.evaluate((textColor) => {
      const board = window.app.getBoard();
      const item = board.selection.list()[0];

      const richText = item.getRichText();
      richText?.setSelectionFontColor(textColor);
    }, textColor);
  },
);

When(
  "User changed text highlight color on {string} by app",
  async (textHighlightColor: string) => {
    await page.evaluate((textHighlightColor) => {
      const board = window.app.getBoard();
      const item = board.selection.list()[0];

      const richText = item.getRichText();
      richText?.setSelectionFontHighlight(textHighlightColor);
    }, textHighlightColor);
  },
);

When(
  "User changed text alignment on {string} by app",
  async (textAlignment: "right" | "center" | "left") => {
    await page.evaluate((textAlignment) => {
      const board = window.app.getBoard();
      const item = board.selection.list()[0];

      const richText = item.getRichText();
      richText?.setSelectionHorisontalAlignment(textAlignment);
    }, textAlignment);
  },
);

Then("Text size changed on {int}", async (expectedFontSize: number) => {
  await page.waitForTimeout(2000);
  const fontSize = await page.evaluate(() => {
    const board = window.app.getBoard();
    const item = board.items.listAll()[0];

    const richText = item.getRichText();
    return Math.ceil(richText?.getFontSize() || 0);
  });

  expect(fontSize).to.be.equal(expectedFontSize);
});

Then(
  "Text size changed on the panel on {string}",
  async (expectedFontSize: string) => {
    const panelFontSizeId = "pick-font-size-input";
    const fontSize = await page.evaluate((panelFontSizeId) => {
      return document.getElementById(panelFontSizeId)?.getAttribute("value");
    }, panelFontSizeId);

    expect(fontSize).to.be.equal(expectedFontSize);
  },
);

Then(
  "Text alignment {string} changed on {string}",
  async (alignmentType: string, expectedTextAlignment: string) => {
    const textAlignment = await page.evaluate((alignmentType) => {
      const board = window.app.getBoard();
      const item = board.items.listAll()[0];

      const richtext = item.getRichText();
      return alignmentType === "Horisontal"
        ? richtext?.getHorisontalAlignment()
        : richtext?.getVerticalAlignment();
    }, alignmentType);

    expect(textAlignment).to.be.equal(expectedTextAlignment);
  },
);

Then("Text style changed on {string}", async (expectedTextStyle: string) => {
  const textStyle = await page.evaluate(() => {
    const board = window.app.getBoard();
    const item = board.items.listAll()[0];

    return item.getRichText()?.getFontStyles();
  });

  expect(textStyle).to.be.include(expectedTextStyle);
});

Then(
  "Text style changed to {string} on {int} object",
  async (expectedTextStyle: string, objectNumber: number) => {
    const textStyle = await page.evaluate((objectNumber) => {
      const board = window.app.getBoard();
      const item = board.items.listAll()[objectNumber];

      return item.getRichText()?.getFontStyles();
    }, objectNumber);

    expect(textStyle).to.include(expectedTextStyle);
  },
);

Then(
  "Text style didnt changed to {string} on {int} object",
  async (expectedTextStyle: string, objectNumber: number) => {
    const textStyle = await page.evaluate((objectNumber) => {
      const board = window.app.getBoard();
      const item = board.items.listAll()[objectNumber];

      return item.getRichText()?.getFontStyles();
    }, objectNumber);

    expect(textStyle).not.to.be.include(expectedTextStyle);
  },
);

Then(
  "Text style didnt changed to {string}",
  async (expectedTextStyle: string) => {
    const textStyle = await page.evaluate(() => {
      const board = window.app.getBoard();
      const item = board.items.listAll()[0];

      return item.getRichText()?.getFontStyles();
    });

    expect(textStyle).not.to.be.include(expectedTextStyle);
  },
);

Then(
  "Text style changed on the panel on {string}",
  async (expectedTextStyle: string) => {
    const fontStyleId = "ChangeFontStyle";
    const pickChangeFontStyle = page.locator("button#" + fontStyleId);
    await pickChangeFontStyle.waitFor(TIMEOUT);
    await pickChangeFontStyle.click(DELAY);

    const pickFontStyleId = "ChangeFont";
    const isActive = await page.evaluate(
      ({ expectedTextStyle, pickFontStyleId }) => {
        const panelEl = document.getElementById(
          pickFontStyleId + expectedTextStyle,
        );
        return panelEl && /active/.test(panelEl.className);
      },
      { expectedTextStyle, pickFontStyleId },
    );

    expect(isActive).to.be.true;
  },
);

Then(
  "Text style didnt changed on the panel on {string}",
  async (expectedTextStyle: string) => {
    const pickChangeFontStyle = page.locator("button#ChangeFontStyle");
    await pickChangeFontStyle.waitFor(TIMEOUT);
    await pickChangeFontStyle.click(DELAY);

    const isActive = await page.evaluate((expectedTextStyle) => {
      const panelEl = document.getElementById("ChangeFont" + expectedTextStyle);
      return panelEl && /active/.test(panelEl.className);
    }, expectedTextStyle);

    expect(isActive).not.to.be.true;
  },
);

Then(
  "Text alignment changed on the panel on {string}",
  async (expectedTextAlignment: string) => {
    const pickChangeFontStyleId = "ChangeTextAlignment";
    const pickChangeFontStyle = page.locator("button#" + pickChangeFontStyleId);
    await pickChangeFontStyle.waitFor(TIMEOUT);
    await pickChangeFontStyle.click(DELAY);

    const pickDirectionChangeFontStyleId = "Change" + expectedTextAlignment;
    const isActive = await page.evaluate((pickDirectionChangeFontStyleId) => {
      const panelEl = document.getElementById(pickDirectionChangeFontStyleId);
      return panelEl && /active/.test(panelEl.className);
    }, pickDirectionChangeFontStyleId);

    expect(isActive).to.be.true;
  },
);

When("User selected paragraph {int}", async (paragraphNumber: number) => {
  const paragraph = await page.evaluate((paragraphNumber) => {
    const board = window.app.getBoard();
    const item = board.items.listAll()[0];

    return item.getRichText()?.getTextString().split(/\n/)[paragraphNumber];
  }, paragraphNumber);

  if (paragraph) {
    const element = page.locator(`text="${paragraph}"`);
    await element.click();
    await element.dblclick();

    await page.waitForTimeout(2000);

    await page.keyboard.press("Home");
    await page.keyboard.press("Home");
    await page.keyboard.down("Shift");
    for (let index = 0; index < paragraph.length; index++) {
      await page.keyboard.press("ArrowRight", DELAY);
    }
    await page.keyboard.up("Shift");
  }
});

Then("Text selection is {string}", async (expectedText: string) => {
  const selectedText = await page.evaluate(() => {
    return window?.getSelection()?.toString().replace(/\n/g, "");
  });

  expect(selectedText).to.be.equal(expectedText);
});

Then(
  "Paragraph text number: {int} has text style: {string}",
  async (paragraphNumber: number, expectedTextStyle: string) => {
    const style = await page.evaluate(
      ([paragraphNumber, expectedTextStyle]) => {
        const board = window.app.getBoard();
        const item = board.items.listAll()[0];

        const paragraph = item.getRichText()?.editor.getText()[paragraphNumber];

        return paragraph?.children[0][expectedTextStyle];
      },
      [paragraphNumber, expectedTextStyle],
    );

    expect(style).to.be.ok;
  },
);

Then(
  "Paragraph text number: {int} hasnt text styles",
  async (paragraphNumber: number) => {
    const style = await page.evaluate((paragraphNumber) => {
      const board = window.app.getBoard();
      const item = board.items.listAll()[0];

      const paragraph = item.getRichText()?.editor.getText()[paragraphNumber];

      return (
        paragraph?.type === "paragraph" &&
        !paragraph?.children[0].bold &&
        !paragraph?.children[0].italic &&
        !paragraph?.children[0].underline &&
        !paragraph?.children[0].lineThrough
      );
    }, paragraphNumber);

    expect(style).to.be.true;
  },
);

Then(
  "Paragraph text number: {int} has text size: {int}",
  async (paragraphNumber: number, expectedTextSize: number) => {
    const textSize = await page.evaluate((paragraphNumber) => {
      const board = window.app.getBoard();
      const item = board.items.listAll()[0];

      const paragraph = item.getRichText()?.editor.getText()[paragraphNumber];

      return paragraph?.type === "paragraph" && paragraph?.children[0].fontSize;
    }, paragraphNumber);

    expect(textSize).to.be.equal(expectedTextSize);
  },
);

Then(
  "Paragraph text number: {int} has text alignment: {string}",
  async (paragraphNumber: number, expectedTextAlignment: number) => {
    const textAlignment = await page.evaluate((paragraphNumber) => {
      const board = window.app.getBoard();
      const item = board.items.listAll()[0];

      const paragraph = item.getRichText()?.editor.getText()[paragraphNumber];
      return paragraph?.type === "paragraph" && paragraph.horisontalAlignment;
    }, paragraphNumber);

    expect(textAlignment).to.be.equal(expectedTextAlignment);
  },
);

Then(
  "Object with number: {int} has a paragraph: {int} with text alignment: {string}",
  async (
    objectNumber: number,
    paragraphNumber: number,
    expectedTextAlignment: string,
  ) => {
    const textAlignment = await page.evaluate(
      ([objectNumber, paragraphNumber]) => {
        const board = window.app.getBoard();
        const item = board.items.listAll()[objectNumber];

        const paragraph = item.getRichText()?.editor.getText()[paragraphNumber];

        return paragraph?.type === "paragraph" && paragraph.horisontalAlignment;
      },
      [objectNumber, paragraphNumber],
    );

    expect(textAlignment).to.be.equal(expectedTextAlignment);
  },
);

Then(
  "Object with number: {int} has a paragraph: {int} with text style: {string}",
  async (
    objectNumber: number,
    paragraphNumber: number,
    expectedTextStyle: string,
  ) => {
    const style = await page.evaluate(
      ([objectNumber, paragraphNumber, expectedTextStyle]) => {
        const board = window.app.getBoard();
        const item = board.items.listAll()[objectNumber];

        const paragraph = item.getRichText().editor.getText()[paragraphNumber];

        return (
          paragraph?.type === "paragraph" &&
          paragraph?.children[0][expectedTextStyle]
        );
      },
      [objectNumber, paragraphNumber, expectedTextStyle],
    );

    expect(style).to.be.ok;
  },
);

Then(
  "Object with number: {int} hasnt a paragraph: {int} with text styles",
  async (objectNumber: number, paragraphNumber: number) => {
    const style = await page.evaluate(
      ([objectNumber, paragraphNumber]) => {
        const board = window.app.getBoard();
        const item = board.items.listAll()[objectNumber];

        const paragraph = item.getRichText()?.editor.getText()[paragraphNumber];

        return (
          paragraph?.type === "paragraph" &&
          !paragraph?.children[0].bold &&
          !paragraph?.children[0].italic &&
          !paragraph?.children[0].underline &&
          !paragraph?.children[0].lineThrough
        );
      },
      [objectNumber, paragraphNumber],
    );

    expect(style).to.be.undefined;
  },
);

Then(
  "Object with number: {int} has a paragraph: {int} with text color: {string}",
  async (
    objectNumber: number,
    paragraphNumber: number,
    expectedTextColor: number,
  ) => {
    const textColor = await page.evaluate(
      ([objectNumber, paragraphNumber]) => {
        const board = window.app.getBoard();
        const item = board.items.listAll()[objectNumber];

        const paragraph = item.getRichText()?.editor.getText()[paragraphNumber];

        return (
          paragraph?.type === "paragraph" && paragraph.children[0].fontColor
        );
      },
      [objectNumber, paragraphNumber],
    );

    expect(textColor).to.be.equal(expectedTextColor);
  },
);

Then(
  "Object with number: {int} has a paragraph: {int} with text highlight color: {string}",
  async (
    objectNumber: number,
    paragraphNumber: number,
    expectedTextHighlightColor: number,
  ) => {
    const textHighlightColor = await page.evaluate(
      ([objectNumber, paragraphNumber]) => {
        const board = window.app.getBoard();
        const item = board.items.listAll()[objectNumber];

        const richText = item.getRichText();
        const paragraph = richText?.editor.getText()[paragraphNumber];

        return (
          paragraph?.type === "paragraph" && paragraph.children[0].fontHighlight
        );
      },
      [objectNumber, paragraphNumber],
    );

    expect(textHighlightColor).to.be.equal(expectedTextHighlightColor);
  },
);
