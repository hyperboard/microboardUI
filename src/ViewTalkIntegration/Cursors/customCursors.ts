import { CursorsMap } from "Board/Pointer/Cursor";
import pencil from "./pencil.svg";
import text from "./text.svg";
import hResize from "./h-resize.svg";
import vResize from "./v-resize.svg";
import neResize from "./ne-resize.svg";
import nwResize from "./nw-resize.svg";
import cross from "./cross.svg";

export const cursorsMap: CursorsMap = {
	text: `url(${text}) 12 12, auto`,
	"e-resize": `url(${hResize}) 16 16, auto`,
	"w-resize": `url(${hResize}) 16 16, auto`,
	"n-resize": `url(${vResize}) 16 16, auto`,
	"s-resize": `url(${vResize}) 16 16, auto`,
	"ne-resize": `url(${neResize}) 16 16, auto`,
	"sw-resize": `url(${neResize}) 16 16, auto`,
	"nw-resize": `url(${nwResize}) 16 16, auto`,
	"se-resize": `url(${nwResize}) 16 16, auto`,
	crosshair: `url(${cross}) 16 16, auto`,
	pen: `url(${pencil}) 5 26, auto`,
};
