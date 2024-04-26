import { Board } from "Board";
import { Mbr } from "Board/Items";
import { createStrictContext, useStrictContext } from "lib/strictContext";

export const PanelContext = createStrictContext<{
	toggleMenu: (menu: string) => void;
	board: Board;
	openedMenu: string;
	panelMbr: Mbr;
	windowHeight: number;
}>();

export function usePanelContext() {
	return useStrictContext(PanelContext);
}
