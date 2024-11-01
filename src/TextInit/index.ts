import setBundleLocator from "dropflow/wasm-locator.js";
import { getApiUrl } from "Config.js";

setBundleLocator(async () => {
	const response = await fetch(
		new URL(`${getApiUrl()}/dropflow.wasm`, import.meta.url),
	);
	if (!response.ok) {
		throw new Error(`Failed to fetch Wasm file: ${response.statusText}`);
	}
	const wasmArrayBuffer = await response.arrayBuffer();
	return new Uint8Array(wasmArrayBuffer);
});

// we need to export dummy to be sure this file does not disappear while tree shaking
export const textInit = (): void => {};
