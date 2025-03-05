import { createStrictContext, useStrictContext } from "lib/strictContext";
import { DrawingTool } from "Board/Settings";

export const AddDrawingContext = createStrictContext<{
	setLastOpenedMenu: (menu: DrawingTool | null) => void;
	lastOpenedMenu: DrawingTool | null;
	setSelectedColor: (color: string) => void;
}>();

export function useAddDrawingContext() {
	return useStrictContext(AddDrawingContext);
}
