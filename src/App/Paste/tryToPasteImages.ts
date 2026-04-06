import { Board, ImageItem } from "microboard-temp";
import { prepareImage } from "shared/api/media/imageHelpers";
import { getApiUrl } from "Config";

export function tryToPasteImages(
  dataTransfer: DataTransfer | null,
  board: Board,
): boolean {
  let isFoundImageInClipboard = false;
  const items = dataTransfer?.items;

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
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      prepareImage(base64String, board.getBoardId(), getApiUrl())
        .then((imageData) => {
          const image = board.createItemAndAdd<ImageItem>("Image", imageData);
          image.apply({
            class: "Transformation",
            method: "translateTo",
            item: [image.getId()],
            x: board.pointer.point.x,
            y: board.pointer.point.y,
          } as any);
        })
        .catch((er) => {
          console.error("Could not create image:", er);
          // TODO notification
        });
    };

    reader.readAsDataURL(file);
  }
  return isFoundImageInClipboard;
}
