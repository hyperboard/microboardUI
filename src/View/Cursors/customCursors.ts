import { CursorsMap } from "Board/Pointer/Cursor";
import pencil from "./pencil.svg";
import stickerPurple from "./sticker/sticker-purple.svg";
import stickerPink from "./sticker/sticker-pink.svg";
import stickerSkyBlue from "./sticker/sticker-sky-blue.svg";
import stickerBlue from "./sticker/sticker-blue.svg";
import stickerGreen from "./sticker/sticker-green.svg";
import stickerLightGreen from "./sticker/sticker-light-green.svg";
import stickerOrange from "./sticker/sticker-orange.svg";
import stickerYellow from "./sticker/sticker-yellow.svg";
import stickerLightGray from "./sticker/sticker-light-gray.svg";
import stickerGray from "./sticker/sticker-gray.svg";
import eraser from "./eraser.svg";
import comment from "./comment.svg";

export const cursorsMap: CursorsMap = {
	eraser: `url(${eraser}) -10 10, auto`,
	pen: `url(${pencil}) 1 24, auto`,
	comment: `url(${comment}) 1 24, auto`,
	"sticker-purple": `url(${stickerPurple}) 12 12, auto`,
	"sticker-pink": `url(${stickerPink}) 12 12, auto`,
	"sticker-sky-blue": `url(${stickerSkyBlue}) 12 12, auto`,
	"sticker-blue": `url(${stickerBlue}) 12 12, auto`,
	"sticker-green": `url(${stickerGreen}) 12 12, auto`,
	"sticker-light-green": `url(${stickerLightGreen}) 12 12, auto`,
	"sticker-orange": `url(${stickerOrange}) 12 12, auto`,
	"sticker-yellow": `url(${stickerYellow}) 12 12, auto`,
	"sticker-light-gray": `url(${stickerLightGray}) 12 12, auto`,
	"sticker-gray": `url(${stickerGray}) 12 12, auto`,
};
