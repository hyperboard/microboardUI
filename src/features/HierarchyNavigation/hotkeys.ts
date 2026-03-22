import {
  editModeHotkeyRegistry,
  getHotkeyLabel,
  hotkeyNames,
} from "microboard-temp";
import { selectParentInHierarchy } from "./hierarchyUi";
import { selectParentHotkeyDefinition } from "./selectParentHotkey";

export const SELECT_PARENT_HOTKEY = "selectParent";

editModeHotkeyRegistry[SELECT_PARENT_HOTKEY as never] = {
  cb: (_event, board) => {
    if (!board) {
      return;
    }
    selectParentInHierarchy(board);
  },
  selectionContext: ["EditUnderPointer", "SelectByRect"],
};

hotkeyNames[SELECT_PARENT_HOTKEY] = selectParentHotkeyDefinition;

export function getSelectParentHotkeyLabel(): string {
  return getHotkeyLabel(SELECT_PARENT_HOTKEY as never);
}
