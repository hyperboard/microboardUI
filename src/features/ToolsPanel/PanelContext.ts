import {
  createStrictContext,
  useStrictContext,
} from "shared/lib/strictContext";

export const PanelContext = createStrictContext<{
  toggleMenu: (menu: string) => void;
  openedMenu: string;
}>();

export function usePanelContext() {
  return useStrictContext(PanelContext);
}
