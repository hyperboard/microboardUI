import { Board } from "Board";
import { createStrictContext, useStrictContext } from "lib/strictContext";

export const PanelContext = createStrictContext<{
	board: Board;
	toggleMenu: (menu: string) => void;
	openedMenu: string;
}>();

export function usePanelContext() {
	return useStrictContext(PanelContext);
}
