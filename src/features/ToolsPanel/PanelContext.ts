import {
  createStrictContext,
  useStrictContext,
} from "shared/lib/strictContext";

export const PanelContext = createStrictContext<{
  toggleMenu: (menu: string) => void;
  openMenu: (menu: string) => void;
  closeMenu: () => void;
  openedMenu: string;
}>();

export function usePanelContext() {
  return useStrictContext(PanelContext);
}
