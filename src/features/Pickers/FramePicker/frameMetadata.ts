import {
  listCreateSurfaceEntries,
  type OverlayOptionDefinition,
  type ToolOverlayDefinition,
} from "microboard-temp";

function getAddFrameOverlayEntry(): ToolOverlayDefinition | undefined {
  const entry = listCreateSurfaceEntries().find((surfaceEntry) => {
    if (surfaceEntry.kind === "tool") {
      return surfaceEntry.tool.toolName === "AddFrame";
    }

    return surfaceEntry.tools.some((tool) => tool.toolName === "AddFrame");
  });

  if (!entry) {
    return undefined;
  }

  if (entry.kind === "tool") {
    return entry.tool;
  }

  return entry.tools.find((tool) => tool.toolName === "AddFrame");
}

export function getAddFrameOverlay(): ToolOverlayDefinition | undefined {
  return getAddFrameOverlayEntry();
}

export function getFramePrimaryControl() {
  return getAddFrameOverlayEntry()?.defaults?.controls[0];
}

export function getFrameOptions(): OverlayOptionDefinition[] {
  const control = getFramePrimaryControl();
  if (!control || control.editor.kind !== "enum-icon") {
    return [];
  }

  return [
    ...control.editor.options,
    ...(control.editor.catalog?.options ?? []),
  ];
}

export function findFrameOption(
  frameValue: string | undefined,
): OverlayOptionDefinition | undefined {
  if (!frameValue) {
    return undefined;
  }

  return getFrameOptions().find((option) => option.value === frameValue);
}
