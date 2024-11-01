import { createStrictContext, useStrictContext } from "lib/strictContext";
import { DrawingTool } from "../../../Tools/AddDrawing";

export const AddDrawingContext = createStrictContext<{
	setLastOpenedMenu: (menu: DrawingTool | null) => void;
	lastOpenedMenu: DrawingTool | null;
	setSelectedColor: (color: string) => void;
}>();

export function useAddDrawingContext() {
	return useStrictContext(AddDrawingContext);
}
