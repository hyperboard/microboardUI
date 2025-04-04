import { Board } from "Board";
import { ImageItem } from "Board/Items/Image";
import { prepareImage } from "Board/Items/Image/ImageHelpers";

export function tryToPasteImages(
	event: ClipboardEvent,
	board: Board,
	accessToken: string | null,
): boolean {
	let isFoundImageInClipboard = false;
	const items = event.clipboardData?.items;

	if (!items) {
		return false;
	}

	for (const item of Array.from(items)) {
		if (item.type.indexOf("image") === -1) {
			continue;
		}
		const file = item.getAsFile();
		if (!file) {
			continue;
		}
		isFoundImageInClipboard = true;
		const reader = new FileReader();
		reader.onload = event => {
			prepareImage(event.target?.result, accessToken)
				.then(imageData => {
					const image = new ImageItem(imageData, board, board.events);
					image.transformation.translateTo(
						board.pointer.point.x,
						board.pointer.point.y,
					);
					board.add(image);
				})
				.catch(er => {
					console.error("Could not create image:", er);
					// TODO notification
				});
		};

		reader.readAsDataURL(file);
	}
	return isFoundImageInClipboard;
}
