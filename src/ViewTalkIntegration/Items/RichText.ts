import { DefaultTextStyles } from "Board/Items/RichText/RichText";
import { getApiUrl } from "Config";
import * as flow from 'dropflow';

export const DEFAULT_TEXT_STYLES: DefaultTextStyles = {
  fontFamily: 'Arial',
  fontSize: 14,
  fontColor: "black",
  fontHighlight: "",
  lineHeight: 1.4,
  bold: false,
  underline: false,
  italic: false,
  "line-through": false,
};

// TODO: replace with ttf/otf fonts
// export async function loadFonts() {
//   await flow.registerFont(new URL('https://s.kontur.ru/common-v2/fonts/LabGrotesque/LabGrotesque-Regular.woff2', import.meta.url));
//   await flow.registerFont(new URL('https://s.kontur.ru/common-v2/fonts/LabGrotesque/LabGrotesque-Bold.woff2', import.meta.url));
//   await flow.registerFont(new URL('https://s.kontur.ru/common-v2/fonts/LabGrotesque/LabGrotesque-Italic.woff2', import.meta.url));
//   await flow.registerFont(new URL('https://s.kontur.ru/common-v2/fonts/LabGrotesque/LabGrotesque-BoldItalic.woff2', import.meta.url));
// }

export async function loadFonts() {
	await flow.registerFont(new URL(`${getApiUrl()}/fonts/Arial.ttf`, import.meta.url));
	await flow.registerFont(new URL(`${getApiUrl()}/fonts/Arial_Bold.ttf`, import.meta.url));
	await flow.registerFont(new URL(`${getApiUrl()}/fonts/Arial_Italic.ttf`, import.meta.url));
	await flow.registerFont(new URL(`${getApiUrl()}/fonts/Arial_Bold_Italic.ttf`, import.meta.url));
}