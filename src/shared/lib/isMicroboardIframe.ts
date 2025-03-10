import { isIframe } from "./isIframe";

export const isMicroboardIframe = () =>
	// @ts-expect-error import.meta object didn't exists in common-js modules
	isIframe() && import.meta.env.INTEGRATION_UI === "microboard";
