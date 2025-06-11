import { Mbr } from "microboard-temp";
import {
	createStrictContext,
	useStrictContext,
} from "shared/lib/strictContext";

export const PanelContext = createStrictContext<{
	toggleMenu: (menu: string) => void;
	openedMenu: string;
	panelMbr: Mbr;
	windowHeight: number;
	windowWidth?: number;
}>();

export function usePanelContext() {
	return useStrictContext(PanelContext);
}
