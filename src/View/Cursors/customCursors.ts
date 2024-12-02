import { CursorsMap } from "Board/Pointer/Cursor";
import pencil from "./pencil.svg";
import stickerBlue from "./sticker/sticker-blue.svg";
import stickerYellow from "./sticker/sticker-yellow.svg";
import stickerGreen from "./sticker/sticker-green.svg";
import stickerPurple from "./sticker/sticker-purple.svg";
import stickerLightBlue from "./sticker/sticker-light-blue.svg";
import stickerRed from "./sticker/sticker-red.svg";
import stickerGray from "./sticker/sticker-gray.svg";
import stickerBlack from "./sticker/sticker-black.svg";
import eraser from "./eraser.svg";
import comment from "./comment.svg";

export const cursorsMap: CursorsMap = {
	eraser: `url(${eraser}) -10 10, auto`,
	pen: `url(${pencil}) 1 24, auto`,
	comment: `url(${comment}) 1 24, auto`,
	"sticker-blue": `url(${stickerBlue}) 12 12, auto`,
	"sticker-yellow": `url(${stickerYellow}) 12 12, auto`,
	"sticker-green": `url(${stickerGreen}) 12 12, auto`,
	"sticker-purple": `url(${stickerPurple}) 12 12, auto`,
	"sticker-light-blue": `url(${stickerLightBlue}) 12 12, auto`,
	"sticker-red": `url(${stickerRed}) 12 12, auto`,
	"sticker-gray": `url(${stickerGray}) 12 12, auto`,
	"sticker-black": `url(${stickerBlack}) 12 12, auto`,
};
