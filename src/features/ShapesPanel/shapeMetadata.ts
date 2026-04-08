import {
  listCreateSurfaceEntries,
  type OverlayOptionDefinition,
  type ToolOverlayDefinition,
} from "microboard-temp";

export type ShapeFamilyName = string;

export type ShapeCategory = {
  name: ShapeFamilyName;
  options: OverlayOptionDefinition[];
};

function getAddShapeOverlayEntry(): ToolOverlayDefinition | undefined {
  const entry = listCreateSurfaceEntries().find((surfaceEntry) => {
    if (surfaceEntry.kind === "tool") {
      return surfaceEntry.tool.toolName === "AddShape";
    }

    return surfaceEntry.tools.some((tool) => tool.toolName === "AddShape");
  });

  if (!entry) {
    return undefined;
  }

  if (entry.kind === "tool") {
    return entry.tool;
  }

  return entry.tools.find((tool) => tool.toolName === "AddShape");
}

export function getAddShapeOverlay(): ToolOverlayDefinition | undefined {
  return getAddShapeOverlayEntry();
}

export function getShapePrimaryControl() {
  return getAddShapeOverlayEntry()?.defaults?.controls[0];
}

export function getShapeQuickOptions(): OverlayOptionDefinition[] {
  const control = getShapePrimaryControl();
  if (!control || control.editor.kind !== "enum-icon") {
    return [];
  }

  const allOptions = [
    ...control.editor.options,
    ...(control.editor.catalog?.options ?? []),
  ];
  const quickOptions = control.editor.quickOptions;
  if (!quickOptions) {
    return allOptions;
  }

  if (quickOptions.optionIds?.length) {
    const allowed = new Set(quickOptions.optionIds);
    return allOptions.filter((option) => allowed.has(option.id));
  }

  if (quickOptions.family) {
    const options = allOptions.filter(
      (option) => option.family === quickOptions.family,
    );

    if (quickOptions.maxVisible !== undefined) {
      return options.slice(0, quickOptions.maxVisible);
    }

    return options;
  }

  if (quickOptions.maxVisible !== undefined) {
    return allOptions.slice(0, quickOptions.maxVisible);
  }

  return allOptions;
}

export function getShapeCategories(): ShapeCategory[] {
  const control = getShapePrimaryControl();
  if (!control || control.editor.kind !== "enum-icon") {
    return [];
  }

  const options = control.editor.catalog?.options ?? control.editor.options;
  const categories = new Map<ShapeFamilyName, OverlayOptionDefinition[]>();

  options.forEach((option) => {
    const family = option.family ?? "basicShapes";
    const current = categories.get(family) ?? [];
    current.push(option);
    categories.set(family, current);
  });

  return [...categories.entries()].map(([name, familyOptions]) => ({
    name,
    options: familyOptions,
  }));
}

export function findShapeOption(
  shapeValue: string | undefined,
): OverlayOptionDefinition | undefined {
  if (!shapeValue) {
    return undefined;
  }

  return getShapeCategories()
    .flatMap((category) => category.options)
    .find((option) => option.value === shapeValue);
}
