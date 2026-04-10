import React, { Fragment, useEffect, useId, useRef, useState } from "react";
import {
  type BaseItem,
  type OverlayActionDefinition,
  type OverlayCatalogDefinition,
  type OverlayControlDefinition,
  type OverlayControlGroupDefinition,
  type OverlayCreateSurfaceGroupEntry,
  type OverlayDynamicOptionsContext,
  type OverlayEditor,
  type OverlayIcon,
  type OverlayInvocation,
  type OverlayOptionDefinition,
  type SelectionOverlayActionDefinition,
  type ToolOverlayDefinition,
  getItemOverlay,
  getSelectionOverlayActions,
  listSelectionActionSections,
  intersectOverlayActions,
  listCreateSurfaceEntries,
  matchesOverlayCondition,
  resolveDynamicOptions,
  SEMANTIC_COLOR_IDS,
  semanticColor,
} from "microboard-temp";
import { useAppContext } from "features/AppContext";
import { usePanelContext as useToolsPanelContext } from "features/ToolsPanel/PanelContext";
import { usePanelContext as useContextPanelContext } from "features/ContextPanel/PanelContext";
import { ButtonWithMenu as ToolbarButtonWithMenu } from "features/ToolsPanel/Buttons/ButtonWithMenu";
import { ButtonWithMenu as ContextButtonWithMenu } from "features/ContextPanel/Buttons/ButtonWithMenu";
import { ColorItem } from "features/Pickers/ColorPicker/ColorItem";
import { SemanticColorPicker } from "features/Pickers/ColorPicker/SemanticColorPicker";
import { SquareColorItem } from "features/Pickers/ColorPicker/SquareColorItem";
import { SliderPicker } from "features/Pickers/SliderPicker/SliderPicker";
import { UiColorInput } from "shared/ui-lib/UiColorInput";
import { UiButton } from "shared/ui-lib/UiButton";
import { UiPanel } from "shared/ui-lib/UiPanel";
import { UiSeparator } from "shared/ui-lib/UiSeparator";
import { Icon, StrokeColorIndicator } from "shared/ui-lib/Icon";
import { FillColorIndicator } from "shared/ui-lib/Icon/FillColorIndicator";
import { getSemanticId, resolveColorForUI } from "shared/lib/resolveColorValue";
import { useAccount } from "App/useAccount";
import { validateMediaFile } from "App/MediaHelpers";
import { uploadImages } from "shared/api/media";
import { OverlayMetadataIcon as BaseOverlayMetadataIcon } from "./OverlayMetadataIcon";
import styles from "./OverlayUi.module.css";

type OverlayActionLike =
  | OverlayActionDefinition
  | SelectionOverlayActionDefinition;

type EditorContext = {
  items: BaseItem[];
  toolName?: string;
  controlsById: Map<string, OverlayControlDefinition>;
  selection?: unknown;
};

type WorkflowUploadEntry = {
  id: string;
  fields: Record<string, File | null>;
};

type WorkflowUploadValue =
  | {
      mode: "single" | "multiple";
      files: File[];
    }
  | {
      mode: "paired";
      entries: WorkflowUploadEntry[];
    };
function capitalize(value: string): string {
  return value ? value[0].toUpperCase() + value.slice(1) : value;
}

function makeRangeArray(length: number, start: number): number[] {
  return Array.from({ length }, (_, index) => start + index);
}

function adaptOutgoingValue(
  control: OverlayControlDefinition,
  value: unknown,
): unknown {
  if (
    control.editor.kind === "color" &&
    typeof value === "string" &&
    (SEMANTIC_COLOR_IDS as readonly string[]).includes(value)
  ) {
    return semanticColor(value as (typeof SEMANTIC_COLOR_IDS)[number]);
  }

  if (
    control.valueAdapter?.kind === "rangeArray" &&
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return makeRangeArray(value, control.valueAdapter.start);
  }

  return value;
}

function adaptIncomingValue(
  control: OverlayControlDefinition,
  value: unknown,
): unknown {
  if (control.valueAdapter?.kind === "rangeArray" && Array.isArray(value)) {
    return value.length;
  }

  return value;
}

function setTargetProperty(
  target: Record<string, unknown>,
  property: string,
  value: unknown,
): void {
  const setterName = `set${capitalize(property)}`;
  const setter = target[setterName];

  if (typeof setter === "function") {
    (
      setter as (this: Record<string, unknown>, nextValue: unknown) => void
    ).call(target, value);
  } else {
    target[property] = value;
  }
}

function emitItemPropertyUpdate(
  items: BaseItem[],
  property: string,
  value: unknown,
): void {
  if (!items.length) {
    return;
  }

  const emitter = items[0] as BaseItem & {
    emit?: (operation: {
      class: "Item";
      method: "setProperty";
      item: string[];
      property: string;
      value: unknown;
      prevValues: unknown[];
    }) => void;
  };

  if (typeof emitter.emit !== "function") {
    items.forEach((item) => {
      setTargetProperty(
        item as unknown as Record<string, unknown>,
        property,
        value,
      );
    });
    return;
  }

  emitter.emit({
    class: "Item",
    method: "setProperty",
    item: items.map((item) => item.getId()),
    property,
    value,
    prevValues: items.map((item) => readTargetProperty(item, property)),
  });
}

function readTargetProperty(target: unknown, property: string): unknown {
  if (!target) {
    return undefined;
  }

  const value = (target as Record<string, unknown>)[property];
  if (typeof value === "function") {
    return (value as () => unknown).call(target);
  }

  return value;
}

function getTool(
  board: ReturnType<typeof useAppContext>["board"],
  toolName: string,
): Record<string, unknown> | undefined {
  switch (toolName) {
    case "AddSticker":
      return board.tools.getAddSticker() as Record<string, unknown> | undefined;
    case "AddShape":
      return board.tools.getAddShape() as Record<string, unknown> | undefined;
    case "AddFrame":
      return board.tools.getAddFrame() as Record<string, unknown> | undefined;
    case "AddConnector":
      return board.tools.getAddConnector() as
        | Record<string, unknown>
        | undefined;
    case "AddText":
      return board.tools.getAddText() as Record<string, unknown> | undefined;
    case "AddDrawing":
      return board.tools.getAddDrawing() as Record<string, unknown> | undefined;
    case "AddHighlighter":
      return board.tools.getAddHighlighter() as
        | Record<string, unknown>
        | undefined;
    case "Eraser":
      return board.tools.getEraser() as Record<string, unknown> | undefined;
    default:
      break;
  }

  return board.tools.getAddRegisteredTool(toolName) as
    | Record<string, unknown>
    | undefined;
}

function getSwatchColor(
  icon: OverlayIcon | undefined,
  items: BaseItem[],
  toolName: string | undefined,
  board: ReturnType<typeof useAppContext>["board"],
): string | null {
  const swatchSource = icon?.state?.swatch;
  if (!swatchSource) {
    return null;
  }

  if (swatchSource.kind === "itemProperty") {
    return resolveColorForUI(
      readTargetProperty(items[0], swatchSource.property),
    );
  }

  if (swatchSource.kind === "selectionProperty") {
    return resolveColorForUI(
      readTargetProperty(board.selection, swatchSource.property),
    );
  }

  const tool = toolName ? getTool(board, toolName) : undefined;
  return resolveColorForUI(readTargetProperty(tool, swatchSource.property));
}

function buildOverlayConditionContext(
  context: EditorContext,
  board: ReturnType<typeof useAppContext>["board"],
): OverlayDynamicOptionsContext {
  return {
    item: context.items[0],
    items: context.items,
    selection: context.selection ?? board.selection,
    tool: context.toolName
      ? (getTool(board, context.toolName) as never)
      : undefined,
  };
}

function getVisibleControls(
  controls: OverlayControlDefinition[],
  context: EditorContext,
  board: ReturnType<typeof useAppContext>["board"],
): OverlayControlDefinition[] {
  const conditionContext = buildOverlayConditionContext(context, board);
  return controls.filter((control) => {
    if (!matchesOverlayCondition(control.when, conditionContext)) {
      return false;
    }

    if (
      (context.toolName === "AddDrawing" ||
        context.toolName === "AddHighlighter") &&
      control.id === "strokeStyle"
    ) {
      return false;
    }

    return true;
  });
}

function getOverlaySliderLabelKey(
  control: OverlayControlDefinition,
): string | undefined {
  if (
    control.id === "strokeWidth" ||
    control.id === "borderWidth" ||
    control.id === "lineWidth"
  ) {
    return "contextPanel.strokeStyle.strokeWidth";
  }

  return undefined;
}

function getSemanticColorRole(
  control: OverlayControlDefinition,
): "background" | "foreground" {
  const property =
    control.valueSource.kind === "itemProperty" ||
    control.valueSource.kind === "toolProperty" ||
    control.valueSource.kind === "selectionProperty"
      ? control.valueSource.property
      : control.id;

  if (
    property === "fontColor" ||
    property === "borderColor" ||
    property === "lineColor" ||
    property === "strokeColor"
  ) {
    return "foreground";
  }

  return "background";
}

function isIconOnlyEnumList(
  editor: Extract<OverlayEditor, { kind: "enum-list" }>,
): boolean {
  return editor.options.every((option) => Boolean(option.icon));
}

function mergeOptionLists(
  primaryOptions: OverlayOptionDefinition[],
  extraOptions: OverlayOptionDefinition[],
): OverlayOptionDefinition[] {
  const options = new Map<string, OverlayOptionDefinition>();
  [...primaryOptions, ...extraOptions].forEach((option) => {
    if (!options.has(option.id)) {
      options.set(option.id, option);
    }
  });
  return [...options.values()];
}

function normalizeOverlayColorValue(value: unknown): unknown {
  if (
    typeof value === "string" &&
    (SEMANTIC_COLOR_IDS as readonly string[]).includes(value)
  ) {
    return semanticColor(value as (typeof SEMANTIC_COLOR_IDS)[number]);
  }

  return value;
}

function areOverlayColorsEqual(left: unknown, right: unknown): boolean {
  if (left === right) {
    return true;
  }

  const leftSemanticId = getSemanticId(left);
  const rightSemanticId = getSemanticId(right);
  if (leftSemanticId && rightSemanticId) {
    return leftSemanticId === rightSemanticId;
  }

  return (
    resolveColorForUI(normalizeOverlayColorValue(left)) ===
    resolveColorForUI(normalizeOverlayColorValue(right))
  );
}

function renderOverlayColorItem(
  color: string,
  value: unknown,
  presentation: "circle" | "square" | "sticker",
  onPick: (color: string) => void,
): React.ReactElement {
  const isActive = areOverlayColorsEqual(value, color);
  const isSquare = presentation === "square" || presentation === "sticker";
  const displayColor =
    color === "transparent"
      ? "transparent"
      : resolveColorForUI(normalizeOverlayColorValue(color));

  if (isSquare) {
    return (
      <SquareColorItem
        key={color}
        color={displayColor}
        selected={isActive}
        onPick={() => onPick(color)}
      />
    );
  }

  return (
    <ColorItem
      key={color}
      color={color === "transparent" ? "none" : displayColor}
      active={isActive}
      onPick={() => onPick(color)}
    />
  );
}

function getOverlayColorInputValue(value: unknown): string {
  const semanticId = getSemanticId(value);
  if (semanticId) {
    return "none";
  }

  const resolved = resolveColorForUI(value);
  return resolved === "none" || resolved === "transparent" ? "none" : resolved;
}

function getControlValue(
  control: OverlayControlDefinition,
  context: EditorContext,
  board: ReturnType<typeof useAppContext>["board"],
): unknown {
  if (control.valueSource?.kind === "itemProperty") {
    return adaptIncomingValue(
      control,
      readTargetProperty(context.items[0], control.valueSource.property),
    );
  }

  if (control.valueSource?.kind === "selectionProperty") {
    return adaptIncomingValue(
      control,
      readTargetProperty(
        context.selection ?? board.selection,
        control.valueSource.property,
      ),
    );
  }

  if (control.valueSource?.kind === "toolProperty" && context.toolName) {
    const tool = getTool(board, context.toolName);
    return adaptIncomingValue(
      control,
      readTargetProperty(tool, control.valueSource.property),
    );
  }

  return undefined;
}

function resolveInvocationArgs(
  invoke: OverlayInvocation | undefined,
  context: EditorContext,
  board: ReturnType<typeof useAppContext>["board"],
): unknown[] {
  const args =
    invoke?.kind === "operation" ||
    invoke?.kind === "customMethod" ||
    invoke?.kind === "selectionMethod"
      ? (invoke.args ?? [])
      : [];

  return args.map((arg) => {
    if (arg.kind === "static") {
      return arg.value;
    }

    const control = context.controlsById.get(arg.controlId);
    if (!control) {
      return undefined;
    }

    return getControlValue(control, context, board);
  });
}

function invokeControl(
  board: ReturnType<typeof useAppContext>["board"],
  control: OverlayControlDefinition,
  context: EditorContext,
  value: unknown,
): void {
  const nextValue = adaptOutgoingValue(control, value);
  const invoke = control.invoke;

  if (invoke?.kind === "setProperty") {
    emitItemPropertyUpdate(context.items, invoke.property, nextValue);
    return;
  }

  if (invoke?.kind === "toolProperty" && context.toolName) {
    const tool = getTool(board, context.toolName);
    if (tool) {
      setTargetProperty(tool, invoke.property, nextValue);
      board.tools.publish();
    }
    return;
  }

  if (invoke?.kind === "selectionMethod") {
    const method = (context.selection ?? board.selection) as Record<
      string,
      unknown
    >;
    const selectionMethod = method[invoke.methodName];
    if (typeof selectionMethod === "function") {
      const args = resolveInvocationArgs(invoke, context, board);
      (selectionMethod as (...nextArgs: unknown[]) => void)(
        ...(args.length ? args : [nextValue]),
      );
    }
    return;
  }

  if (
    (invoke?.kind === "operation" || invoke?.kind === "customMethod") &&
    context.items.length > 0
  ) {
    const args = resolveInvocationArgs(invoke, context, board);
    context.items.forEach((item) => {
      const methodName =
        invoke.kind === "operation" ? invoke.method : invoke.methodName;
      const target = item as unknown as Record<string, unknown>;
      const method = target[methodName];
      if (typeof method === "function") {
        (method as (...nextArgs: unknown[]) => void)(
          ...(args.length ? args : [nextValue]),
        );
      }
    });
  }
}

function invokeAction(
  board: ReturnType<typeof useAppContext>["board"],
  action: OverlayActionLike,
  context: EditorContext,
): void {
  if (!action.invoke) {
    return;
  }

  const args = resolveInvocationArgs(action.invoke, context, board);

  if (action.invoke.kind === "selectionMethod") {
    const method = (board.selection as unknown as Record<string, unknown>)[
      action.invoke.methodName
    ];
    if (typeof method === "function") {
      (method as (...nextArgs: unknown[]) => void)(...args);
    }
    return;
  }

  if (action.invoke.kind === "toolProperty" && context.toolName) {
    const tool = getTool(board, context.toolName);
    if (tool) {
      setTargetProperty(tool, action.invoke.property, args[0]);
      board.tools.publish();
    }
    return;
  }

  const methodName =
    action.invoke.kind === "operation"
      ? action.invoke.method
      : action.invoke.kind === "customMethod"
        ? action.invoke.methodName
        : null;

  if (!methodName) {
    return;
  }

  context.items.forEach((item) => {
    const method = (item as unknown as Record<string, unknown>)[methodName];
    if (typeof method === "function") {
      (method as (...nextArgs: unknown[]) => void)(...args);
    }
  });
}

function OverlayMetadataIcon({
  icon,
  items,
  toolName,
  label,
  size = 24,
}: {
  icon?: OverlayIcon;
  items?: BaseItem[];
  toolName?: string;
  label?: string;
  size?: number;
}): React.ReactElement {
  const { board } = useAppContext();
  const swatchColor = getSwatchColor(icon, items ?? [], toolName, board);

  return (
    <span className={styles.iconWrap}>
      <BaseOverlayMetadataIcon icon={icon} label={label} size={size} />
      {swatchColor && swatchColor !== "none" ? (
        <span className={styles.swatch} style={{ color: swatchColor }} />
      ) : null}
    </span>
  );
}

function OptionButton({
  option,
  selected,
  onClick,
  items,
  toolName,
  size = "md",
}: {
  option: OverlayOptionDefinition;
  selected: boolean;
  onClick: () => void;
  items: BaseItem[];
  toolName?: string;
  size?: "sm" | "md";
}): React.ReactElement {
  return (
    <UiButton
      onClick={onClick}
      active={selected}
      variant="secondary"
      size={size}
      className={styles.optionButton}
      tooltip={option.label}
      tooltipPosition="top"
    >
      {option.icon ? (
        <OverlayMetadataIcon
          icon={option.icon}
          items={items}
          toolName={toolName}
          label={option.label}
          size={20}
        />
      ) : (
        <span>{option.label}</span>
      )}
    </UiButton>
  );
}

function renderCatalog(
  catalog: OverlayCatalogDefinition,
  value: unknown,
  onChange: (nextValue: unknown) => void,
  items: BaseItem[],
): React.ReactElement {
  return (
    <div className={styles.catalog}>
      <div className={styles.menuTitle}>{catalog.label}</div>
      <div className={styles.grid}>
        {catalog.options.map((option) => (
          <OptionButton
            key={option.id}
            option={option}
            selected={option.value === value}
            onClick={() => onChange(option.value)}
            items={items}
            size="sm"
          />
        ))}
      </div>
    </div>
  );
}

function getQuickOptions(
  editor: Extract<OverlayEditor, { kind: "enum-icon" }>,
): OverlayOptionDefinition[] {
  const allOptions = mergeOptionLists(
    editor.options,
    editor.catalog?.options ?? [],
  );
  const quickOptions = editor.quickOptions;
  if (!quickOptions) {
    return allOptions;
  }

  let options = allOptions;
  if (quickOptions.optionIds?.length) {
    const allowed = new Set(quickOptions.optionIds);
    options = allOptions.filter((option) => allowed.has(option.id));
  } else if (quickOptions.family) {
    options = allOptions.filter(
      (option) => option.family === quickOptions.family,
    );
  }

  if (quickOptions.maxVisible !== undefined) {
    options = options.slice(0, quickOptions.maxVisible);
  }

  return options;
}

function OverlayAssetUploadField({
  control,
  context,
  value,
  onChange,
}: {
  control: OverlayControlDefinition;
  context: EditorContext;
  value?: WorkflowUploadValue;
  onChange?: (nextValue: WorkflowUploadValue) => void;
}): React.ReactElement {
  const { board } = useAppContext();
  const account = useAccount();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const editor = control.editor.kind === "asset-upload" ? control.editor : null;
  const pairedFields = editor?.fields ?? [];

  if (!editor) {
    return <div className={styles.label}>Unsupported upload</div>;
  }

  const createEmptyPairedEntry = (): WorkflowUploadEntry => ({
    id: `${control.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    fields: Object.fromEntries(
      pairedFields.map((field) => [field.id, null]),
    ) as Record<string, File | null>,
  });

  const handleClick = (): void => {
    inputRef.current?.click();
  };

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = async (
    event,
  ) => {
    const input = event.currentTarget;
    const files = input.files ? Array.from(input.files) : [];
    if (!files.length) {
      return;
    }

    const validFiles = files.filter((file) => validateMediaFile(file, account));
    if (!validFiles.length) {
      input.value = "";
      return;
    }

    setIsUploading(true);
    try {
      const urls = await uploadImages(validFiles, board.getBoardId());
      if (!urls.length) {
        return;
      }

      const nextValue = editor.mode === "multiple" ? urls : (urls[0] ?? "");

      if (onChange) {
        onChange({
          mode: editor.mode === "multiple" ? "multiple" : "single",
          files: validFiles,
        });
      } else {
        invokeControl(board, control, context, nextValue);
      }
    } finally {
      input.value = "";
      setIsUploading(false);
    }
  };

  if (onChange && editor.mode === "paired") {
    const pairedValue =
      value?.mode === "paired"
        ? value
        : { mode: "paired" as const, entries: [createEmptyPairedEntry()] };

    const updateEntryField = (
      entryId: string,
      fieldId: string,
      file: File | null,
    ): void => {
      onChange({
        mode: "paired",
        entries: pairedValue.entries.map((entry) =>
          entry.id === entryId
            ? {
                ...entry,
                fields: {
                  ...entry.fields,
                  [fieldId]: file,
                },
              }
            : entry,
        ),
      });
    };

    const removeEntry = (entryId: string): void => {
      const remaining = pairedValue.entries.filter(
        (entry) => entry.id !== entryId,
      );
      onChange({
        mode: "paired",
        entries: remaining.length ? remaining : [createEmptyPairedEntry()],
      });
    };

    return (
      <div className={styles.assetUpload}>
        {pairedValue.entries.map((entry, index) => (
          <div key={entry.id} className={styles.pairedUploadRow}>
            {pairedFields.map((field) => (
              <label key={field.id} className={styles.uploadFieldLabel}>
                <span className={styles.uploadFieldTitle}>{field.label}</span>
                <span className={styles.uploadFieldButton}>
                  {entry.fields[field.id]?.name ??
                    `Choose ${field.label.toLowerCase()}`}
                </span>
                <input
                  className={styles.hiddenInput}
                  type="file"
                  accept={(field.accept ?? editor.accept)?.join(",")}
                  multiple={false}
                  onChange={(event) => {
                    const file = event.currentTarget.files?.[0] ?? null;
                    if (file && !validateMediaFile(file, account)) {
                      event.currentTarget.value = "";
                      return;
                    }
                    updateEntryField(entry.id, field.id, file);
                    event.currentTarget.value = "";
                  }}
                />
              </label>
            ))}
            {pairedValue.entries.length > 1 ? (
              <UiButton
                size="sm"
                variant="quaternary"
                onClick={() => removeEntry(entry.id)}
              >
                Remove
              </UiButton>
            ) : null}
            <span className={styles.uploadEntryLabel}>Pair {index + 1}</span>
          </div>
        ))}
        <UiButton
          onClick={() =>
            onChange({
              mode: "paired",
              entries: [...pairedValue.entries, createEmptyPairedEntry()],
            })
          }
          variant="quaternary"
          size="sm"
        >
          Add pair
        </UiButton>
      </div>
    );
  }

  return (
    <div className={styles.assetUpload}>
      <UiButton
        onClick={handleClick}
        variant="secondary"
        size="sm"
        disabled={isUploading}
      >
        {isUploading ? "Uploading..." : control.label}
      </UiButton>
      <input
        id={inputId}
        ref={inputRef}
        className={styles.hiddenInput}
        type="file"
        accept={editor.accept?.join(",")}
        multiple={editor.mode === "multiple"}
        onChange={handleChange}
      />
    </div>
  );
}

function ControlEditor({
  control,
  context,
  valueOverride,
  onValueChange,
}: {
  control: OverlayControlDefinition;
  context: EditorContext;
  valueOverride?: unknown;
  onValueChange?: (nextValue: unknown) => void;
}): React.ReactElement {
  const { board } = useAppContext();
  const value =
    valueOverride !== undefined
      ? valueOverride
      : getControlValue(control, context, board);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);

  const updateValue = (nextValue: unknown): void => {
    if (onValueChange) {
      onValueChange(nextValue);
      return;
    }
    invokeControl(board, control, context, nextValue);
  };

  const renderEditor = (editor: OverlayEditor): React.ReactElement => {
    switch (editor.kind) {
      case "color": {
        const paletteContainsSemanticIds = (editor.palette ?? []).some(
          (color) =>
            typeof color === "string" &&
            (SEMANTIC_COLOR_IDS as readonly string[]).includes(color),
        );

        if (paletteContainsSemanticIds) {
          return (
            <div className={styles.squareColorMenu}>
              <div className={styles.squareColorGrid}>
                <SemanticColorPicker
                  currentValue={value}
                  onPick={(nextColor) => updateValue(nextColor)}
                  role={getSemanticColorRole(control)}
                  variant={
                    editor.presentation === "square" ||
                    editor.presentation === "sticker"
                      ? "square"
                      : "circle"
                  }
                />
              </div>
            </div>
          );
        }

        return (
          <div
            className={
              editor.presentation === "square" ||
              editor.presentation === "sticker"
                ? styles.squareColorMenu
                : styles.colorMenu
            }
          >
            <div
              className={
                editor.presentation === "square" ||
                editor.presentation === "sticker"
                  ? styles.squareColorGrid
                  : styles.colorGrid
              }
            >
              {(editor.palette ?? []).map((color) =>
                renderOverlayColorItem(
                  color,
                  value,
                  editor.presentation ?? "circle",
                  (nextColor) => updateValue(nextColor),
                ),
              )}
              <UiColorInput
                color={getOverlayColorInputValue(value)}
                isActive={getOverlayColorInputValue(value) !== "none"}
                onChange={(nextColor) => updateValue(nextColor)}
              />
            </div>
          </div>
        );
      }
      case "enum-icon": {
        const quickOptions = getQuickOptions(editor);
        const hasCollapsedCatalog =
          Boolean(editor.catalog) &&
          Boolean(editor.quickOptions) &&
          editor.quickOptions?.overflow === "show-more";

        return (
          <div className={styles.menuSection}>
            <div className={styles.grid}>
              {(hasCollapsedCatalog && !isCatalogOpen
                ? quickOptions
                : mergeOptionLists(
                    editor.options,
                    editor.catalog?.options ?? [],
                  )
              ).map((option) => (
                <OptionButton
                  key={option.id}
                  option={option}
                  selected={option.value === value}
                  onClick={() => {
                    updateValue(option.value);
                    setIsCatalogOpen(false);
                  }}
                  items={context.items}
                  toolName={context.toolName}
                />
              ))}
            </div>
            {hasCollapsedCatalog && !isCatalogOpen ? (
              <UiButton
                size="sm"
                variant="quaternary"
                onClick={() => setIsCatalogOpen(true)}
                className={styles.showMoreButton}
              >
                Show all
              </UiButton>
            ) : null}
            {editor.catalog && (!hasCollapsedCatalog || isCatalogOpen)
              ? renderCatalog(editor.catalog, value, updateValue, context.items)
              : null}
          </div>
        );
      }
      case "enum-list":
        return (
          <div
            className={
              isIconOnlyEnumList(editor) ? styles.iconList : styles.list
            }
          >
            {editor.options.map((option) => (
              <UiButton
                key={option.id}
                onClick={() => updateValue(option.value)}
                active={option.value === value}
                variant="secondary"
                size="sm"
                className={
                  isIconOnlyEnumList(editor) ? styles.optionButton : undefined
                }
              >
                {option.icon ? (
                  <OverlayMetadataIcon
                    icon={option.icon}
                    items={context.items}
                    toolName={context.toolName}
                    label={option.label}
                    size={18}
                  />
                ) : null}
                {!isIconOnlyEnumList(editor) ? (
                  <span>{option.label}</span>
                ) : null}
              </UiButton>
            ))}
          </div>
        );
      case "number":
      case "number-stepper":
        return (
          <div className={styles.menuSection}>
            <div className={styles.numberRow}>
              {editor.kind === "number-stepper" ? (
                <UiButton
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    updateValue(
                      Math.max(
                        editor.min ?? Number.MIN_SAFE_INTEGER,
                        Number(value ?? 0) - editor.step,
                      ),
                    )
                  }
                >
                  -
                </UiButton>
              ) : null}
              <input
                className={styles.numberInput}
                type="number"
                min={editor.min}
                max={editor.max}
                step={editor.step}
                value={typeof value === "number" ? value : ""}
                onChange={(event) =>
                  updateValue(Number(event.currentTarget.value))
                }
              />
              {editor.kind === "number-stepper" ? (
                <UiButton
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    updateValue(
                      Math.min(
                        editor.max ?? Number.MAX_SAFE_INTEGER,
                        Number(value ?? 0) + editor.step,
                      ),
                    )
                  }
                >
                  +
                </UiButton>
              ) : null}
            </div>
            {editor.kind === "number-stepper" && editor.presets?.length ? (
              <div className={styles.grid}>
                {editor.presets.map((preset) => (
                  <UiButton
                    key={preset}
                    size="sm"
                    variant="secondary"
                    active={value === preset}
                    onClick={() => updateValue(preset)}
                  >
                    {preset}
                  </UiButton>
                ))}
              </div>
            ) : null}
          </div>
        );
      case "slider": {
        const sliderLabelKey = getOverlaySliderLabelKey(control);
        return (
          <div className={styles.menuSection}>
            <SliderPicker
              onPick={(nextValue) => updateValue(nextValue)}
              min={editor.min}
              max={editor.max}
              step={editor.step ?? 1}
              value={typeof value === "number" ? value : editor.min}
              showLabel={Boolean(sliderLabelKey)}
              labelKey={sliderLabelKey}
            />
          </div>
        );
      }
      case "toggle":
        return (
          <div className={styles.toggleRow}>
            <div className={styles.toggleLabels}>
              <span>{editor.falseLabel ?? "Off"}</span>
              <span>/</span>
              <span>{editor.trueLabel ?? "On"}</span>
            </div>
            <UiButton
              size="sm"
              variant="secondary"
              active={Boolean(value)}
              onClick={() => updateValue(!value)}
            >
              {Boolean(value)
                ? (editor.trueLabel ?? "On")
                : (editor.falseLabel ?? "Off")}
            </UiButton>
          </div>
        );
      case "dynamic-options": {
        const options = resolveDynamicOptions(editor.providerId, {
          item: context.items[0],
          items: context.items,
          selection: context.selection,
          tool: context.toolName
            ? (getTool(board, context.toolName) as never)
            : undefined,
        });
        const layoutClass =
          editor.presentation === "icon-grid" ? styles.grid : styles.list;

        return (
          <div className={layoutClass}>
            {options.map((option) => (
              <UiButton
                key={option.id}
                size="sm"
                variant="secondary"
                active={option.value === value}
                onClick={() => updateValue(option.value)}
              >
                {option.icon ? (
                  <OverlayMetadataIcon
                    icon={option.icon}
                    items={context.items}
                    toolName={context.toolName}
                    label={option.label}
                    size={18}
                  />
                ) : null}
                {option.label}
              </UiButton>
            ))}
          </div>
        );
      }
      case "catalog":
        return renderCatalog(
          {
            kind: "catalog",
            label: editor.label ?? control.label,
            family: editor.family,
            options: editor.options,
          },
          value,
          updateValue,
          context.items,
        );
      case "asset-upload":
        return (
          <OverlayAssetUploadField
            control={control}
            context={context}
            value={value as WorkflowUploadValue | undefined}
            onChange={
              onValueChange as
                | ((nextValue: WorkflowUploadValue) => void)
                | undefined
            }
          />
        );
      default:
        return <div className={styles.label}>Unsupported editor</div>;
    }
  };

  return renderEditor(control.editor);
}

function OverlayControlsMenu({
  controls,
  groups,
  context,
  compact = false,
}: {
  controls: OverlayControlDefinition[];
  groups?: OverlayControlGroupDefinition[];
  context: EditorContext;
  compact?: boolean;
}): React.ReactElement {
  const { board } = useAppContext();
  const [showAdvancedGroups, setShowAdvancedGroups] = useState(false);
  const visibleControls = getVisibleControls(controls, context, board);
  const controlsById = new Map(
    visibleControls.map((control) => [control.id, control]),
  );
  const conditionContext = buildOverlayConditionContext(context, board);

  const baseGroups = groups?.length
    ? groups.filter((group) =>
        matchesOverlayCondition(group.when, conditionContext),
      )
    : [
        {
          id: "default",
          label: "",
          controlIds: visibleControls.map((control) => control.id),
        },
      ];

  const groupsToRender =
    compact && baseGroups.length > 1 && !showAdvancedGroups
      ? baseGroups.slice(0, 1)
      : baseGroups;

  return (
    <UiPanel vertical className={styles.menu}>
      {groupsToRender.map((group, groupIndex) => {
        const groupControls = group.controlIds
          .map((controlId) => controlsById.get(controlId))
          .filter((control): control is OverlayControlDefinition =>
            Boolean(control),
          );

        if (!groupControls.length) {
          return null;
        }

        return (
          <Fragment key={group.id}>
            <div className={styles.menuSection}>
              {groupControls.map((control) => (
                <ControlEditor
                  key={control.id}
                  control={control}
                  context={context}
                />
              ))}
            </div>
            {groupIndex < groupsToRender.length - 1 ? (
              <div className={styles.divider} />
            ) : null}
          </Fragment>
        );
      })}
      {compact && baseGroups.length > 1 && !showAdvancedGroups ? (
        <UiButton
          size="sm"
          variant="quaternary"
          onClick={() => setShowAdvancedGroups(true)}
          className={styles.showMoreButton}
        >
          More options
        </UiButton>
      ) : null}
    </UiPanel>
  );
}

function placeCreatedItem(
  board: ReturnType<typeof useAppContext>["board"],
  item: BaseItem,
  placement: "center-viewport" | "stagger-from-pointer" | undefined,
  index: number,
): void {
  const center =
    placement === "center-viewport"
      ? board.camera.getMbr().getCenter()
      : board.pointer.point;
  const offset = placement === "stagger-from-pointer" ? index * 28 : 0;
  const mbr = item.getMbr();
  const x = center.x + offset - mbr.getWidth() / 2;
  const y = center.y + offset - mbr.getHeight() / 2;

  item.apply({
    class: "Transformation",
    method: "translateTo",
    item: [item.getId()],
    x,
    y,
  } as never);
}

async function uploadWorkflowControlValue(
  uploadValue: WorkflowUploadValue,
  boardId: string,
): Promise<
  | { mode: "single" | "multiple"; urls: string[] }
  | {
      mode: "paired";
      entries: Array<{ id: string; fields: Record<string, string> }>;
    }
> {
  if (uploadValue.mode === "single" || uploadValue.mode === "multiple") {
    const urls = await uploadImages(uploadValue.files, boardId);
    return {
      mode: uploadValue.mode,
      urls,
    };
  }

  if (uploadValue.mode !== "paired") {
    return {
      mode: "single",
      urls: [],
    };
  }

  const entries = await Promise.all(
    uploadValue.entries.map(async (entry) => {
      const fieldEntries = Object.entries(entry.fields).filter(([, file]) =>
        Boolean(file),
      ) as Array<[string, File]>;
      const urls = await uploadImages(
        fieldEntries.map(([, file]) => file),
        boardId,
      );
      return {
        id: entry.id,
        fields: Object.fromEntries(
          fieldEntries.map(([fieldId], index) => [fieldId, urls[index] ?? ""]),
        ),
      };
    }),
  );

  return {
    mode: "paired",
    entries,
  };
}

function OverlayWorkflowMenu({
  overlay,
  onSubmit,
}: {
  overlay: ToolOverlayDefinition;
  onSubmit?: () => void;
}): React.ReactElement | null {
  const { board } = useAppContext();
  const workflow =
    overlay.launch?.kind === "workflow" ? overlay.launch.workflow : null;
  const [draftValues, setDraftValues] = useState<Record<string, unknown>>({});
  const [uploadValues, setUploadValues] = useState<
    Record<string, WorkflowUploadValue>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!workflow) {
    return null;
  }

  const controlsById = new Map(
    workflow.controls.map((control) => [control.id, control]),
  );

  const handleSubmit = async (): Promise<void> => {
    if (!workflow.submit || workflow.submit.kind !== "create-items") {
      onSubmit?.();
      return;
    }

    setIsSubmitting(true);
    try {
      const uploadedValues = Object.fromEntries(
        await Promise.all(
          workflow.controls
            .filter((control) => control.editor.kind === "asset-upload")
            .map(async (control) => {
              const uploadValue = uploadValues[control.id];
              if (!uploadValue) {
                return [control.id, undefined] as const;
              }
              const uploaded = await uploadWorkflowControlValue(
                uploadValue,
                board.getBoardId(),
              );
              return [control.id, uploaded] as const;
            }),
        ),
      );

      const count =
        workflow.submit.strategy === "per-upload-entry"
          ? Math.max(
              1,
              ...workflow.submit.properties.map((binding) => {
                if (binding.source.kind !== "uploadField") {
                  return 1;
                }
                const uploaded = uploadedValues[binding.source.controlId];
                if (!uploaded) {
                  return 0;
                }
                return uploaded.mode === "paired"
                  ? uploaded.entries.length
                  : uploaded.urls.length;
              }),
            )
          : 1;

      const createdItems: BaseItem[] = [];

      for (let index = 0; index < count; index += 1) {
        const itemData = Object.fromEntries(
          workflow.submit.properties.map((binding) => {
            if (binding.source.kind === "controlValue") {
              return [binding.property, draftValues[binding.source.controlId]];
            }

            const uploaded = uploadedValues[binding.source.controlId];
            if (!uploaded) {
              return [binding.property, ""];
            }

            if (uploaded.mode === "paired") {
              return [
                binding.property,
                uploaded.entries[index]?.fields[binding.source.fieldId ?? ""] ??
                  "",
              ];
            }

            return [
              binding.property,
              uploaded.urls[index] ?? uploaded.urls[0] ?? "",
            ];
          }),
        );

        const item = board.createItemAndAdd<BaseItem>(
          workflow.submit.itemType,
          itemData,
        );
        placeCreatedItem(board, item, workflow.submit.placement, index);
        createdItems.push(item);
      }

      if (createdItems.length) {
        board.selection.removeAll();
        createdItems.forEach((item) => board.selection.add(item));
      }

      onSubmit?.();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <UiPanel vertical className={styles.menu}>
      {workflow.description ? (
        <div className={styles.menuTitle}>{workflow.description}</div>
      ) : null}
      <div className={styles.menuSection}>
        {workflow.controls.map((control) => (
          <ControlEditor
            key={control.id}
            control={control}
            context={{
              items: [],
              toolName: overlay.toolName,
              controlsById,
            }}
            valueOverride={draftValues[control.id] ?? uploadValues[control.id]}
            onValueChange={(nextValue) => {
              if (control.editor.kind === "asset-upload") {
                setUploadValues((current) => ({
                  ...current,
                  [control.id]: nextValue as WorkflowUploadValue,
                }));
                return;
              }

              setDraftValues((current) => ({
                ...current,
                [control.id]: nextValue,
              }));
            }}
          />
        ))}
      </div>
      <UiButton
        variant="primary"
        size="sm"
        onClick={() => {
          void handleSubmit();
        }}
        disabled={isSubmitting}
        className={styles.submitButton}
      >
        {isSubmitting ? "Submitting..." : (workflow.submitLabel ?? "Submit")}
      </UiButton>
    </UiPanel>
  );
}

function createControlsMap(
  action: OverlayActionLike | ToolOverlayDefinition["defaults"],
): Map<string, OverlayControlDefinition> {
  const controls = action?.controls;
  return new Map((controls ?? []).map((control) => [control.id, control]));
}

function getToolIsActive(
  board: ReturnType<typeof useAppContext>["board"],
  toolName: string,
): boolean {
  return Boolean(getTool(board, toolName));
}

function activateTool(
  board: ReturnType<typeof useAppContext>["board"],
  toolName: string,
): void {
  board.tools.addRegisteredTool(toolName, true);
}

function getControlOptions(
  control: OverlayControlDefinition | undefined,
): OverlayOptionDefinition[] {
  if (!control) {
    return [];
  }

  if (control.editor.kind === "enum-icon") {
    return [
      ...control.editor.options,
      ...(control.editor.catalog?.options ?? []),
    ];
  }

  if (control.editor.kind === "catalog") {
    return control.editor.options;
  }

  if (control.editor.kind === "enum-list") {
    return control.editor.options;
  }

  return [];
}

function getOverlayPrimaryControl(
  overlay: ToolOverlayDefinition,
): OverlayControlDefinition | undefined {
  return overlay.defaults?.controls[0];
}

function getActionPrimaryControl(
  action: OverlayActionLike,
): OverlayControlDefinition | undefined {
  return action.controls?.[0];
}

function getActionDisplayOption(
  action: OverlayActionLike,
  board: ReturnType<typeof useAppContext>["board"],
  items: BaseItem[],
): OverlayOptionDefinition | undefined {
  const primaryControl = getActionPrimaryControl(action);
  if (!primaryControl) {
    return undefined;
  }

  const controlsById = createControlsMap(action);
  const context: EditorContext = {
    items,
    controlsById,
    selection: board.selection,
  };
  const currentValue = getControlValue(primaryControl, context, board);
  return getControlOptions(primaryControl).find(
    (option) => option.value === currentValue,
  );
}

function getToolDisplayOption(
  overlay: ToolOverlayDefinition,
  board: ReturnType<typeof useAppContext>["board"],
): OverlayOptionDefinition | undefined {
  const primaryControl = getOverlayPrimaryControl(overlay);
  if (!primaryControl) {
    return undefined;
  }

  const controlsById = createControlsMap(overlay.defaults ?? { controls: [] });
  const context: EditorContext = {
    items: [],
    toolName: overlay.toolName,
    controlsById,
    selection: board.selection,
  };
  const currentValue = getControlValue(primaryControl, context, board);
  return getControlOptions(primaryControl).find(
    (option) => option.value === currentValue,
  );
}

function OverlayToolbarGroup({
  entry,
}: {
  entry: OverlayCreateSurfaceGroupEntry;
}): React.ReactElement | null {
  const { board } = useAppContext();
  const { openedMenu, openMenu, closeMenu } = useToolsPanelContext();
  const overlays = entry.tools;
  const activeOverlay = overlays.find((overlay) =>
    getToolIsActive(board, overlay.toolName),
  );
  const [lastToolName, setLastToolName] = useState(
    activeOverlay?.toolName ?? overlays[0]?.toolName ?? "",
  );
  const [isOpen, setIsOpen] = useState(false);
  const currentOverlay =
    overlays.find((overlay) => overlay.toolName === lastToolName) ??
    activeOverlay ??
    overlays[0];
  const behavior = entry.behavior ?? "open-panel";

  useEffect(() => {
    if (activeOverlay) {
      setLastToolName(activeOverlay.toolName);
    }
  }, [activeOverlay]);

  useEffect(() => {
    if (behavior === "activate-last-used" && isOpen && !activeOverlay) {
      setIsOpen(false);
      if (overlays.some((overlay) => overlay.toolName === openedMenu)) {
        closeMenu();
      }
    }
  }, [activeOverlay, behavior, closeMenu, isOpen, openedMenu, overlays]);

  if (!currentOverlay) {
    return null;
  }

  const currentOption = getToolDisplayOption(currentOverlay, board);
  const currentIcon = currentOption?.icon ?? currentOverlay.icon;
  const currentLabel = currentOption?.label ?? currentOverlay.label;
  const groupIsActive =
    behavior === "activate-last-used" ? Boolean(activeOverlay) : isOpen;

  return (
    <ToolbarButtonWithMenu
      isOpen={isOpen}
      button={
        <UiButton
          id={`tool-group-${entry.id}`}
          tooltip={entry.label}
          active={groupIsActive}
          variant="secondary"
          rounded={behavior === "open-panel" ? "top" : "none"}
          className={styles.toolbarButton}
          onClick={() => {
            if (behavior === "activate-last-used" && !activeOverlay) {
              activateTool(board, currentOverlay.toolName);
              setIsOpen(true);
              if (currentOverlay.defaults?.controls.length) {
                openMenu(currentOverlay.toolName);
              }
              return;
            }

            setIsOpen((prev) => {
              const next = !prev;
              if (next && currentOverlay.defaults?.controls.length) {
                openMenu(currentOverlay.toolName);
              } else if (
                !next &&
                overlays.some((overlay) => overlay.toolName === openedMenu)
              ) {
                closeMenu();
              }
              return next;
            });
          }}
        >
          <OverlayMetadataIcon
            icon={currentIcon ?? entry.icon}
            label={currentLabel}
          />
        </UiButton>
      }
    >
      <UiPanel vertical padding={0} className={styles.launcherMenu}>
        {overlays.map((overlay, index) => (
          <OverlayToolbarTool
            key={overlay.toolName}
            overlay={overlay}
            rounded={
              index === 0
                ? "top"
                : index === overlays.length - 1
                  ? "bottom"
                  : "none"
            }
            openDefaultsOnActivate={false}
            onActivate={() => {
              setLastToolName(overlay.toolName);
              setIsOpen(true);
              if (overlay.defaults?.controls.length) {
                openMenu(overlay.toolName);
              } else if (
                overlays.some(
                  (groupOverlay) => groupOverlay.toolName === openedMenu,
                )
              ) {
                closeMenu();
              }
            }}
          />
        ))}
      </UiPanel>
    </ToolbarButtonWithMenu>
  );
}

function getOverlayToolbarSections(): {
  leading: React.ReactElement[];
  main: React.ReactElement[];
} {
  const entries = listCreateSurfaceEntries().filter((entry) => {
    if (entry.kind === "tool") {
      return (
        entry.tool.toolName !== "AddShape" &&
        entry.tool.toolName !== "AddFrame" &&
        entry.tool.toolName !== "AddConnector"
      );
    }

    return !entry.tools.some(
      (tool) =>
        tool.toolName === "AddShape" ||
        tool.toolName === "AddFrame" ||
        tool.toolName === "AddConnector",
    );
  });
  const leading: React.ReactElement[] = [];
  const main: React.ReactElement[] = [];

  entries.forEach((entry) => {
    if (entry.kind === "group" && entry.order === 1) {
      leading.push(<OverlayToolbarGroup key={entry.id} entry={entry} />);
      return;
    }

    if (entry.kind === "group") {
      main.push(<OverlayToolbarGroup key={entry.id} entry={entry} />);
      return;
    }

    main.push(
      <OverlayToolbarTool key={entry.tool.toolName} overlay={entry.tool} />,
    );
  });

  return { leading, main };
}

export function OverlayToolbarLeadingTools(): React.ReactElement[] {
  return getOverlayToolbarSections().leading;
}

export function OverlayToolbarMainTools(): React.ReactElement[] {
  return getOverlayToolbarSections().main;
}

export function OverlayToolbarTools(): React.ReactElement[] {
  const sections = getOverlayToolbarSections();
  return [...sections.leading, ...sections.main];
}

function OverlayToolbarTool({
  overlay,
  rounded = "none",
  openDefaultsOnActivate = true,
  onActivate,
}: {
  overlay: ToolOverlayDefinition;
  rounded?:
    | "none"
    | "left"
    | "right"
    | "top"
    | "bottom"
    | "bottom-right"
    | "bottom-left"
    | "full";
  openDefaultsOnActivate?: boolean;
  onActivate?: () => void;
}): React.ReactElement {
  const { board } = useAppContext();
  const { openedMenu, toggleMenu, openMenu } = useToolsPanelContext();
  const isWorkflow = overlay.launch?.kind === "workflow";
  const isActive = getToolIsActive(board, overlay.toolName);
  const hasDefaults = Boolean(overlay.defaults?.controls.length);
  const isOpen = isWorkflow
    ? openedMenu === overlay.toolName
    : openedMenu === overlay.toolName && isActive && hasDefaults;
  const controlsById = createControlsMap(overlay.defaults ?? { controls: [] });
  const selectedOption = getToolDisplayOption(overlay, board);
  const displayIcon = selectedOption?.icon ?? overlay.icon;
  const displayLabel = selectedOption?.label ?? overlay.label;

  const handleClick = (): void => {
    if (isWorkflow) {
      toggleMenu(overlay.toolName);
      return;
    }

    if (!isActive) {
      activateTool(board, overlay.toolName);
      onActivate?.();
      if (hasDefaults && openDefaultsOnActivate) {
        openMenu(overlay.toolName);
      }
      return;
    }

    if (hasDefaults) {
      if (openDefaultsOnActivate) {
        toggleMenu(overlay.toolName);
      } else {
        onActivate?.();
      }
    } else {
      board.tools.cancel();
    }
  };

  return (
    <ToolbarButtonWithMenu
      isOpen={isOpen}
      button={
        <UiButton
          id={`tool-${overlay.toolName}`}
          tooltip={overlay.label}
          active={isWorkflow ? isOpen : isActive}
          onClick={handleClick}
          variant="secondary"
          rounded={rounded}
          className={styles.toolbarButton}
        >
          <OverlayMetadataIcon
            icon={displayIcon}
            items={[]}
            toolName={overlay.toolName}
            label={displayLabel}
          />
        </UiButton>
      }
    >
      {isWorkflow ? (
        <OverlayWorkflowMenu
          overlay={overlay}
          onSubmit={() => toggleMenu(overlay.toolName)}
        />
      ) : overlay.defaults ? (
        <OverlayControlsMenu
          controls={overlay.defaults.controls}
          groups={overlay.defaults.groups}
          compact
          context={{
            items: [],
            toolName: overlay.toolName,
            controlsById,
            selection: board.selection,
          }}
        />
      ) : null}
    </ToolbarButtonWithMenu>
  );
}

function OverlayContextAction({
  action,
  items,
  rounded = "none",
}: {
  action: OverlayActionLike;
  items: BaseItem[];
  rounded?: "none" | "left";
}): React.ReactElement {
  const { board } = useAppContext();
  const { openedMenu, toggleMenu, panelMbr, windowHeight, windowWidth } =
    useContextPanelContext();

  const hasControls = Boolean(action.controls?.length);
  const controlsById = createControlsMap(action);
  const menuName = action.id;
  const isOpen = openedMenu === menuName && hasControls;

  const handleClick = (): void => {
    if (hasControls) {
      toggleMenu(menuName);
      return;
    }

    invokeAction(board, action, {
      items,
      controlsById,
      selection: board.selection,
    });
  };

  const selectedOption = getActionDisplayOption(action, board, items);
  const displayIcon = selectedOption?.icon ?? action.icon;
  const displayLabel = selectedOption?.label ?? action.label;
  const buttonRounded = action.id === "shape.shapeType" ? "none" : rounded;

  if (action.id === "shape.fill" && action.controls?.length) {
    const fillControl = action.controls.find(
      (control) => control.id === "backgroundColor",
    );
    if (fillControl && fillControl.editor.kind === "color") {
      const value = getControlValue(
        fillControl,
        { items, controlsById, selection: board.selection },
        board,
      );
      const fillColor = resolveColorForUI(value);
      const colorInputValue = getOverlayColorInputValue(value);

      return (
        <ContextButtonWithMenu
          menuName={menuName}
          openedMenu={openedMenu}
          panelMbr={panelMbr}
          windowHeight={windowHeight}
          windowWidth={windowWidth}
          align="left"
          button={
            <UiButton
              tooltip={action.label}
              tooltipPosition="top"
              variant="secondary"
              rounded={buttonRounded}
              onClick={handleClick}
              active={isOpen}
            >
              <FillColorIndicator width={24} height={24} color={fillColor} />
            </UiButton>
          }
        >
          <UiPanel vertical className={styles.menu}>
            <div className={styles.colorMenu}>
              <div className={styles.colorGrid}>
                {(fillControl.editor.palette ?? []).map((color) =>
                  renderOverlayColorItem(
                    color,
                    value,
                    fillControl.editor.presentation ?? "circle",
                    (nextColor) =>
                      invokeControl(
                        board,
                        fillControl,
                        { items, controlsById, selection: board.selection },
                        nextColor,
                      ),
                  ),
                )}
                <UiColorInput
                  color={colorInputValue}
                  isActive={colorInputValue !== "none"}
                  onChange={(nextColor) =>
                    invokeControl(
                      board,
                      fillControl,
                      { items, controlsById, selection: board.selection },
                      nextColor,
                    )
                  }
                />
              </div>
            </div>
          </UiPanel>
        </ContextButtonWithMenu>
      );
    }
  }

  if (action.id === "shape.strokeStyle" && action.controls?.length) {
    const borderColorControl = action.controls.find(
      (control) => control.id === "borderColor",
    );
    const borderWidthControl = action.controls.find(
      (control) => control.id === "borderWidth",
    );
    const borderStyleControl = action.controls.find(
      (control) => control.id === "borderStyle",
    );

    if (
      borderColorControl?.editor.kind === "color" &&
      borderWidthControl?.editor.kind === "number-stepper" &&
      borderStyleControl?.editor.kind === "enum-list"
    ) {
      const context: EditorContext = {
        items,
        controlsById,
        selection: board.selection,
      };
      const borderColorValue = getControlValue(
        borderColorControl,
        context,
        board,
      );
      const borderStyleValue = getControlValue(
        borderStyleControl,
        context,
        board,
      );
      const borderWidthValue = getControlValue(
        borderWidthControl,
        context,
        board,
      );
      const colorInputValue = getOverlayColorInputValue(borderColorValue);

      return (
        <ContextButtonWithMenu
          menuName={menuName}
          openedMenu={openedMenu}
          panelMbr={panelMbr}
          windowHeight={windowHeight}
          windowWidth={windowWidth}
          align="left"
          button={
            <UiButton
              tooltip={action.label}
              tooltipPosition="top"
              variant="secondary"
              rounded={buttonRounded}
              onClick={handleClick}
              active={isOpen}
            >
              <StrokeColorIndicator
                color={resolveColorForUI(borderColorValue)}
              />
            </UiButton>
          }
        >
          <UiPanel vertical className={styles.menu}>
            <div className={styles.menuSection}>
              <div className={styles.iconList}>
                {borderStyleControl.editor.options.map((option) => (
                  <UiButton
                    key={option.id}
                    onClick={() =>
                      invokeControl(
                        board,
                        borderStyleControl,
                        context,
                        option.value,
                      )
                    }
                    active={option.value === borderStyleValue}
                    variant="secondary"
                    size="sm"
                    className={styles.optionButton}
                    tooltip={option.label}
                    tooltipPosition="top"
                  >
                    {option.icon ? (
                      <OverlayMetadataIcon
                        icon={option.icon}
                        items={items}
                        label={option.label}
                        size={18}
                      />
                    ) : null}
                  </UiButton>
                ))}
              </div>
            </div>
            <div className={styles.divider} />
            <div className={styles.menuSection}>
              <SliderPicker
                onPick={(nextWidth) =>
                  invokeControl(board, borderWidthControl, context, nextWidth)
                }
                min={borderWidthControl.editor.min}
                max={borderWidthControl.editor.max}
                step={borderWidthControl.editor.step ?? 1}
                value={
                  typeof borderWidthValue === "number"
                    ? borderWidthValue
                    : borderWidthControl.editor.min
                }
                showLabel
                labelKey="contextPanel.strokeStyle.strokeWidth"
              />
            </div>
            <div className={styles.divider} />
            <div className={styles.colorMenu}>
              <div className={styles.colorGrid}>
                {(borderColorControl.editor.palette ?? []).some(
                  (color) =>
                    typeof color === "string" &&
                    (SEMANTIC_COLOR_IDS as readonly string[]).includes(color),
                ) ? (
                  <SemanticColorPicker
                    currentValue={borderColorValue}
                    onPick={(nextColor) =>
                      invokeControl(
                        board,
                        borderColorControl,
                        context,
                        nextColor,
                      )
                    }
                    role="foreground"
                  />
                ) : (
                  (borderColorControl.editor.palette ?? []).map((color) =>
                    renderOverlayColorItem(
                      color,
                      borderColorValue,
                      borderColorControl.editor.presentation ?? "circle",
                      (nextColor) =>
                        invokeControl(
                          board,
                          borderColorControl,
                          context,
                          nextColor,
                        ),
                    ),
                  )
                )}
                <UiColorInput
                  color={colorInputValue}
                  isActive={colorInputValue !== "none"}
                  onChange={(nextColor) =>
                    invokeControl(board, borderColorControl, context, nextColor)
                  }
                />
              </div>
            </div>
          </UiPanel>
        </ContextButtonWithMenu>
      );
    }
  }

  return (
    <ContextButtonWithMenu
      menuName={menuName}
      openedMenu={openedMenu}
      panelMbr={panelMbr}
      windowHeight={windowHeight}
      windowWidth={windowWidth}
      align="left"
      button={
        <UiButton
          tooltip={action.label}
          tooltipPosition="top"
          variant="secondary"
          rounded={buttonRounded}
          onClick={handleClick}
          active={isOpen}
        >
          <OverlayMetadataIcon
            icon={displayIcon}
            items={items}
            label={displayLabel}
          />
        </UiButton>
      }
    >
      <OverlayControlsMenu
        controls={action.controls ?? []}
        groups={action.groups}
        context={{
          items,
          controlsById,
          selection: board.selection,
        }}
      />
    </ContextButtonWithMenu>
  );
}

function getOverlayContextActionList(
  board: ReturnType<typeof useAppContext>["board"],
  {
    includeItemActions = true,
    includeSelectionActions = true,
  }: {
    includeItemActions?: boolean;
    includeSelectionActions?: boolean;
  } = {},
): OverlayActionLike[] {
  const items = board.selection.items.list() as BaseItem[];
  const overlay = items.length ? getItemOverlay(items[0]) : undefined;
  const sameOverlay =
    overlay &&
    items.every((item) => getItemOverlay(item)?.itemType === overlay.itemType)
      ? overlay
      : undefined;
  const conditionContext = {
    item: items[0],
    items,
    selection: board.selection,
  };

  const sharedActions = intersectOverlayActions(items).filter((action) =>
    matchesOverlayCondition(action.when, conditionContext),
  );
  const sharedActionsById = new Map(
    sharedActions.map((action) => [action.id, action]),
  );

  const orderedItemActions =
    includeItemActions && sameOverlay?.sections?.length
      ? sameOverlay.sections.flatMap((section) =>
          section.actionIds
            .map((actionId) => sharedActionsById.get(actionId))
            .filter((action): action is OverlayActionDefinition =>
              Boolean(action),
            ),
        )
      : includeItemActions
        ? sharedActions
        : [];

  const leftoverItemActions = includeItemActions
    ? sharedActions.filter(
        (action) =>
          !orderedItemActions.some((ordered) => ordered.id === action.id),
      )
    : [];

  return [
    ...orderedItemActions,
    ...leftoverItemActions,
    ...(includeSelectionActions ? getSelectionOverlayActions(items) : []),
  ];
}

function getOverlayContextActionSections(
  board: ReturnType<typeof useAppContext>["board"],
  {
    includeItemActions = true,
    includeSelectionActions = true,
  }: {
    includeItemActions?: boolean;
    includeSelectionActions?: boolean;
  } = {},
): OverlayActionLike[][] {
  const items = board.selection.items.list() as BaseItem[];
  const overlay = items.length ? getItemOverlay(items[0]) : undefined;
  const sameOverlay =
    overlay &&
    items.every((item) => getItemOverlay(item)?.itemType === overlay.itemType)
      ? overlay
      : undefined;
  const actions = getOverlayContextActionList(board, {
    includeItemActions,
    includeSelectionActions,
  });
  const actionsById = new Map(actions.map((action) => [action.id, action]));
  const sections: OverlayActionLike[][] = [];
  const consumedIds = new Set<string>();

  if (includeItemActions && sameOverlay?.sections?.length) {
    sameOverlay.sections.forEach((section) => {
      const sectionActions = section.actionIds
        .map((actionId) => actionsById.get(actionId))
        .filter((action): action is OverlayActionLike => Boolean(action));

      if (!sectionActions.length) {
        return;
      }

      sectionActions.forEach((action) => consumedIds.add(action.id));
      sections.push(sectionActions);
    });
  }

  if (includeSelectionActions) {
    listSelectionActionSections().forEach((section) => {
      const sectionActions = section.actionIds
        .map((actionId) => actionsById.get(actionId))
        .filter((action): action is OverlayActionLike => Boolean(action));

      if (!sectionActions.length) {
        return;
      }

      sectionActions.forEach((action) => consumedIds.add(action.id));
      sections.push(sectionActions);
    });
  }

  const leftovers = actions
    .filter((action) => !consumedIds.has(action.id))
    .sort((left, right) => {
      const leftOrder =
        "order" in left && typeof left.order === "number"
          ? left.order
          : Number.MAX_SAFE_INTEGER;
      const rightOrder =
        "order" in right && typeof right.order === "number"
          ? right.order
          : Number.MAX_SAFE_INTEGER;
      return leftOrder - rightOrder || left.label.localeCompare(right.label);
    });

  if (leftovers.length) {
    sections.push(leftovers);
  }

  return sections;
}

export function OverlayContextActions({
  includeItemActions = true,
  includeSelectionActions = true,
}: {
  includeItemActions?: boolean;
  includeSelectionActions?: boolean;
} = {}): React.ReactElement[] {
  const { board } = useAppContext();
  const items = board.selection.items.list() as BaseItem[];
  const sections = getOverlayContextActionSections(board, {
    includeItemActions,
    includeSelectionActions,
  });

  return sections.flatMap((actions, sectionIndex) => {
    const elements = actions.map((action, actionIndex) => (
      <OverlayContextAction
        key={action.id}
        action={action}
        items={items}
        rounded={sectionIndex === 0 && actionIndex === 0 ? "left" : "none"}
      />
    ));

    if (sectionIndex < sections.length - 1) {
      elements.push(
        <UiSeparator key={`overlay-section-${sectionIndex}`} vertical />,
      );
    }

    return elements;
  });
}
