import { DefaultTextStyles } from "Board/Items/RichText/RichText";
import { getApiUrl } from "Config";
import * as flow from "dropflow";

export const DEFAULT_TEXT_STYLES: DefaultTextStyles = {
	fontFamily: "Open Sans",
	fontSize: 14,
	fontColor: "black",
	fontHighlight: "",
	lineHeight: 1.4,
	bold: false,
	underline: false,
	italic: false,
	lineThrough: false,
};

export async function loadFonts(): Promise<void> {
	await flow.registerFont(
		new URL(`${getApiUrl()}/fonts/OpenSans-Regular.ttf`, import.meta.url),
	);
	await flow.registerFont(
		new URL(`${getApiUrl()}/fonts/OpenSans-Bold.ttf`, import.meta.url),
	);
	await flow.registerFont(
		new URL(`${getApiUrl()}/fonts/OpenSans-Italic.ttf`, import.meta.url),
	);
	await flow.registerFont(
		new URL(
			`${getApiUrl()}/fonts/OpenSans-BoldItalic.ttf`,
			import.meta.url,
		),
	);
}
