import { DefaultTextStyles } from "Board/Items/RichText/RichText";
import { getApiUrl } from "Config";
import * as flow from "dropflow";

export const DEFAULT_TEXT_STYLES: DefaultTextStyles = {
	// fontFamily: "Arial",
	fontFamily: "Noto Sans",
	fontSize: 14,
	fontColor: "black",
	fontHighlight: "",
	lineHeight: 1.4,
	bold: false,
	underline: false,
	italic: false,
	"line-through": false,
};

export async function loadFonts(): Promise<void> {
	const ruDiv = flow.h("div", {}, [
		"АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя",
		flow.h("div", { style: { fontStyle: "italic", fontWeight: 800 } }, [
			"АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя",
		]),
		flow.h("div", { style: {} }, [
			"АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя",
		]),
		flow.h("div", { style: { fontWeight: 800 } }, [
			"АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя",
		]),
		flow.h("div", { style: { fontStyle: "italic" } }, [
			"АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя",
		]),
	]);

	const symbolsDiv = flow.h("div", {}, [
		"0123456789,.;:!?@#$%^&*()_+-=[]{}|\\'\"<>/~`",
		flow.h("div", { style: { fontStyle: "italic", fontWeight: 800 } }, [
			"0123456789,.;:!?@#$%^&*()_+-=[]{}|\\'\"<>/~`",
		]),
		flow.h("div", { style: {} }, [
			"0123456789,.;:!?@#$%^&*()_+-=[]{}|\\'\"<>/~`",
		]),
		flow.h("div", { style: { fontWeight: 800 } }, [
			"0123456789,.;:!?@#$%^&*()_+-=[]{}|\\'\"<>/~`",
		]),
		flow.h("div", { style: { fontStyle: "italic" } }, [
			"0123456789,.;:!?@#$%^&*()_+-=[]{}|\\'\"<>/~`",
		]),
	]);

	const engDiv = flow.h("div", {}, [
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
		flow.h("div", { style: { fontStyle: "italic", fontWeight: 800 } }, [
			"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
		]),
		flow.h("div", { style: {} }, [
			"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
		]),
		flow.h("div", { style: { fontWeight: 800 } }, [
			"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
		]),
		flow.h("div", { style: { fontStyle: "italic" } }, [
			"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
		]),
	]);

	const all = flow.h("div", [ruDiv, symbolsDiv, engDiv]);
	await flow.loadNotoFonts(all);
	// await flow.loadNotoFonts(ruDiv);
	// await flow.loadNotoFonts(engDiv);
	// await flow.loadNotoFonts(symbolsDiv);
	return;
	await flow.registerFont(
		new URL(`${getApiUrl()}/fonts/Arial.ttf`, import.meta.url),
	);
	await flow.registerFont(
		new URL(`${getApiUrl()}/fonts/Arial_Bold.ttf`, import.meta.url),
	);
	await flow.registerFont(
		new URL(`${getApiUrl()}/fonts/Arial_Italic.ttf`, import.meta.url),
	);
	await flow.registerFont(
		new URL(`${getApiUrl()}/fonts/Arial_Bold_Italic.ttf`, import.meta.url),
	);
}
