import { DefaultTextStyles } from "Board/Items/RichText/RichText";
import { getApiUrl } from "Config";
// import * as flow from "dropflow";

export const DEFAULT_TEXT_STYLES: DefaultTextStyles = {
	fontFamily: "Lab Grotesque",
	fontSize: 14,
	fontColor: "black",
	fontHighlight: "",
	lineHeight: 1.4,
	bold: false,
	underline: false,
	italic: false,
	"line-through": false,
};
/*
export async function loadFonts() {
	await flow.registerFont(
		new URL(`${getApiUrl()}/fonts/LabGrotesqueK.ttf`, import.meta.url),
	);
	await flow.registerFont(
		new URL(`${getApiUrl()}/fonts/LabGrotesqueK_Bold.ttf`, import.meta.url),
	);
	await flow.registerFont(
		new URL(
			`${getApiUrl()}/fonts/LabGrotesqueK_Italic.ttf`,
			import.meta.url,
		),
	);
	await flow.registerFont(
		new URL(
			`${getApiUrl()}/fonts/LabGrotesqueK_Bold_Italic.ttf`,
			import.meta.url,
		),
	);
}
*/
