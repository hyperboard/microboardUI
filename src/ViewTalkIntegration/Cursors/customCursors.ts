import { CursorsMap } from "Board/Pointer/Cursor";
import cross from "./cross.svg";
import cursor from "./default.svg";
import grab from "./grab.svg";
import grabbing from "./grabbing.svg";
import hResize from "./h-resize.svg";
import neResize from "./ne-resize.svg";
import nwResize from "./nw-resize.svg";
import pencil from "./pencil.svg";
import pointer from "./pointer.svg";
import text from "./text.svg";
import vResize from "./v-resize.svg";

export const cursorsMap: CursorsMap = {
	text: `url(../${text}) 12 12, auto`,
	"e-resize": `url(../${hResize}) 27 21, auto`,
	"w-resize": `url(../${hResize}) 27 21, auto`,
	"n-resize": `url(../${vResize}) 21 27, auto`,
	"s-resize": `url(../${vResize}) 21 27, auto`,
	"ne-resize": `url(../${neResize}) 24 25, auto`,
	"sw-resize": `url(../${neResize}) 24 25, auto`,
	"nw-resize": `url(../${nwResize}) 24 25, auto`,
	"se-resize": `url(../${nwResize}) 24 25, auto`,
	crosshair: `url(../${cross}) 24 20, auto`,
	pen: `url(../${pencil}) 5 26, auto`,
	pointer: `url(../${pointer}) 13 9, auto`,
	grab: `url(../${grab}) 15 15, auto`,
	grabbing: `url(../${grabbing}) 15 15, auto`,
	default: `url(../${cursor}) 10 7, auto`,
};
