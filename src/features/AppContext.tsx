import { App } from "App";
import type { Board } from "Board";
import {
	createStrictContext,
	useStrictContext,
} from "shared/lib/strictContext";

type AppContext = {
	app: App;
	board: Board;
};

export const AppContext = createStrictContext<AppContext>();

export function useAppContext() {
	return useStrictContext(AppContext);
}
