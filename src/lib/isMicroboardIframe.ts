import { isIframe } from "./isIframe";

export const isMicroboardIframe = () =>
	isIframe() && import.meta.env.INTEGRATION_UI === "microboard";
