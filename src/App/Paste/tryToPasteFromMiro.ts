import { Board } from "Board";
import { pasteMiroClipboard } from "features/ImportMiro/ImportMiroBoards/ImportBoardItem/MiroClipboardTransformer";
import { getGlobalModalFunctions } from "features/Modal/ModalProvider";

export function tryToPasteFromMiro(
	event: ClipboardEvent,
	board: Board,
	isLoggedIn: boolean,
): boolean {
	const html = event?.clipboardData?.getData("text/html");
	const isDataFromMiro = html && /miro/i.test(html.substring(0, 100));
	if (!isDataFromMiro) {
		return false;
	}
	try {
		const decoded = decodeMiroData(html);

		if (decoded !== null) {
			const miroData = JSON.parse(decoded);

			if (!isLoggedIn && miroData !== null) {
				const { showModal } = getGlobalModalFunctions();
				showModal?.("authClipboardMiro");
				return true;
			}

			pasteMiroClipboard(board, miroData || []);

			return true;
		}
	} catch (err) {
		console.error(err);
		// TODO: notification/ toast?
	}
	return false;
}

function adjustMiroBytes(byteArray: Uint8Array, adjustment: number): void {
	for (let i = 0; i < byteArray.length; i++) {
		const byte = byteArray[i];
		if (byte < 256) {
			byteArray[i] = (byte + adjustment) % 256;
		}
	}
}

function getMiroVersionSuffix(version: number): string {
	return version > 0 ? `-v${version}` : "";
}

function decodeMiroData(encodedData: string): string | null {
	return (function (encodedString: string, adjustment: number): string {
		const decodedBase64 = atob(encodedString);
		const byteArray = new Uint8Array(decodedBase64.length);

		for (let i = 0; i < byteArray.length; i++) {
			byteArray[i] = decodedBase64.charCodeAt(i);
		}

		adjustMiroBytes(byteArray, 197);
		return new TextDecoder().decode(byteArray);
	})(
		(function (data: string, version = 1): string | null {
			const versionSuffix = getMiroVersionSuffix(version);
			const regex = new RegExp(
				`<--\\(miro-data${versionSuffix}\\)(.*)(\\(\\/miro-data${versionSuffix}\\)-->)`,
				"gi",
			);
			const match = regex.exec(data);
			return match ? match[1] : null;
		})(encodedData) || encodedData,
		0,
	);
}
