import React, { Fragment } from "react";
import {
  type BaseItem,
  type OverlayActionDefinition,
  type OverlayCatalogDefinition,
  type OverlayControlDefinition,
  type OverlayControlGroupDefinition,
  type OverlayEditor,
  type OverlayIcon,
  type OverlayInvocation,
  type OverlayOptionDefinition,
  type SelectionOverlayActionDefinition,
  type ToolOverlayDefinition,
  getSelectionOverlayActions,
  intersectOverlayActions,
  listToolOverlays,
  resolveDynamicOptions,
} from "microboard-temp";
import { useAppContext } from "features/AppContext";
import { usePanelContext as useToolsPanelContext } from "features/ToolsPanel/PanelContext";
import { usePanelContext as useContextPanelContext } from "features/ContextPanel/PanelContext";
import { ButtonWithMenu as ToolbarButtonWithMenu } from "features/ToolsPanel/Buttons/ButtonWithMenu";
import { ButtonWithMenu as ContextButtonWithMenu } from "features/ContextPanel/Buttons/ButtonWithMenu";
import { UiButton } from "shared/ui-lib/UiButton";
import { UiPanel } from "shared/ui-lib/UiPanel";
import { Icon } from "shared/ui-lib/Icon";
import { resolveColorForUI } from "shared/lib/resolveColorValue";
import styles from "./OverlayUi.module.css";

type OverlayActionLike =
  | OverlayActionDefinition
  | SelectionOverlayActionDefinition;

type EditorContext = {
  items: BaseItem[];
  toolName?: string;
  controlsById: Map<string, OverlayControlDefinition>;
};

function capitalize(value: string): string {
  return value ? value[0].toUpperCase() + value.slice(1) : value;
}

function getSvgSymbolId(icon: OverlayIcon | undefined): string | null {
  if (!icon) {
    return null;
  }

  if (icon.kind === "symbol") {
    return icon.key;
  }

  const fileName = icon.path.split("/").pop();
  if (!fileName) {
    return null;
  }

  return fileName.replace(/\.icon\.svg$/i, "").replace(/\.svg$/i, "");
}

function hasSvgSymbol(symbolId: string | null): boolean {
  if (!symbolId || typeof document === "undefined") {
    return false;
  }

  return Boolean(document.getElementById(symbolId));
}

function makeRangeArray(length: number, start: number): number[] {
  return Array.from({ length }, (_, index) => start + index);
}

function adaptOutgoingValue(
  control: OverlayControlDefinition,
  value: unknown,
): unknown {
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
    (setter as (nextValue: unknown) => void)(value);
  } else {
    target[property] = value;
  }
}

function getTool(
  board: ReturnType<typeof useAppContext>["board"],
  toolName: string,
): Record<string, unknown> | undefined {
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
    const item = items[0] as unknown as Record<string, unknown> | undefined;
    return item ? resolveColorForUI(item[swatchSource.property]) : null;
  }

  const tool = toolName ? getTool(board, toolName) : undefined;
  return tool ? resolveColorForUI(tool[swatchSource.property]) : null;
}

function getControlValue(
  control: OverlayControlDefinition,
  context: EditorContext,
  board: ReturnType<typeof useAppContext>["board"],
): unknown {
  if (control.valueSource?.kind === "itemProperty") {
    const item = context.items[0] as unknown as
      | Record<string, unknown>
      | undefined;
    return adaptIncomingValue(control, item?.[control.valueSource.property]);
  }

  if (control.valueSource?.kind === "toolProperty" && context.toolName) {
    const tool = getTool(board, context.toolName);
    return adaptIncomingValue(control, tool?.[control.valueSource.property]);
  }

  if (
    control.id === "fontSize" &&
    typeof board.selection.getFontSize === "function"
  ) {
    return board.selection.getFontSize();
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
    context.items.forEach((item) => {
      setTargetProperty(
        item as unknown as Record<string, unknown>,
        invoke.property,
        nextValue,
      );
    });
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
  items: BaseItem[];
  toolName?: string;
  label?: string;
  size?: number;
}): React.ReactElement {
  const { board } = useAppContext();
  const swatchColor = getSwatchColor(icon, items, toolName, board);
  const symbolId = getSvgSymbolId(icon);
  const canUseSprite = hasSvgSymbol(symbolId);

  let content: React.ReactElement;

  if (canUseSprite && symbolId) {
    content = (
      <svg width={size} height={size} fill="none">
        <use href={`#${symbolId}`} />
      </svg>
    );
  } else if (label) {
    content = (
      <span
        style={{
          width: size,
          height: size,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: Math.max(10, Math.floor(size / 2.4)),
          fontWeight: 600,
          lineHeight: 1,
        }}
      >
        {label.slice(0, 1).toUpperCase()}
      </span>
    );
  } else {
    content = <Icon iconName="Gear" width={size} height={size} />;
  }

  return (
    <span className={styles.iconWrap}>
      {content}
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

function ControlEditor({
  control,
  context,
}: {
  control: OverlayControlDefinition;
  context: EditorContext;
}): React.ReactElement {
  const { board } = useAppContext();
  const value = getControlValue(control, context, board);

  const updateValue = (nextValue: unknown): void => {
    invokeControl(board, control, context, nextValue);
  };

  const renderEditor = (editor: OverlayEditor): React.ReactElement => {
    switch (editor.kind) {
      case "color":
        return (
          <div className={styles.grid}>
            {(editor.palette ?? []).map((color) => {
              const swatchValue =
                color === "transparent"
                  ? "transparent"
                  : resolveColorForUI(color);
              const isActive = value === color;
              return (
                <UiButton
                  key={color}
                  onClick={() => updateValue(color)}
                  active={isActive}
                  variant="secondary"
                  size="sm"
                  className={styles.colorButton}
                >
                  <span
                    className={
                      color === "transparent"
                        ? styles.transparentSwatch
                        : undefined
                    }
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 999,
                      background:
                        color === "transparent" ? undefined : swatchValue,
                    }}
                  />
                </UiButton>
              );
            })}
          </div>
        );
      case "enum-icon":
        return (
          <div className={styles.menuSection}>
            <div className={styles.grid}>
              {editor.options.map((option) => (
                <OptionButton
                  key={option.id}
                  option={option}
                  selected={option.value === value}
                  onClick={() => updateValue(option.value)}
                  items={context.items}
                  toolName={context.toolName}
                />
              ))}
            </div>
            {editor.catalog
              ? renderCatalog(editor.catalog, value, updateValue, context.items)
              : null}
          </div>
        );
      case "enum-list":
        return (
          <div className={styles.list}>
            {editor.options.map((option) => (
              <UiButton
                key={option.id}
                onClick={() => updateValue(option.value)}
                active={option.value === value}
                variant="secondary"
                size="sm"
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
                <span>{option.label}</span>
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
      case "slider":
        return (
          <div className={styles.menuSection}>
            <input
              className={styles.slider}
              type="range"
              min={editor.min}
              max={editor.max}
              step={editor.step ?? 1}
              value={typeof value === "number" ? value : editor.min}
              onChange={(event) =>
                updateValue(Number(event.currentTarget.value))
              }
            />
            <div className={styles.label}>
              {typeof value === "number" ? `${value}${editor.unit ?? ""}` : ""}
            </div>
          </div>
        );
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
      default:
        return <div className={styles.label}>Unsupported editor</div>;
    }
  };

  return (
    <div className={styles.menuSection}>
      <div className={styles.label}>{control.label}</div>
      {renderEditor(control.editor)}
    </div>
  );
}

function OverlayControlsMenu({
  controls,
  groups,
  context,
}: {
  controls: OverlayControlDefinition[];
  groups?: OverlayControlGroupDefinition[];
  context: EditorContext;
}): React.ReactElement {
  const groupsToRender = groups?.length
    ? groups
    : [
        {
          id: "default",
          label: "",
          controlIds: controls.map((control) => control.id),
        },
      ];

  return (
    <UiPanel vertical className={styles.menu}>
      {groupsToRender.map((group, groupIndex) => {
        const groupControls = group.controlIds
          .map((controlId) => context.controlsById.get(controlId))
          .filter((control): control is OverlayControlDefinition =>
            Boolean(control),
          );

        return (
          <Fragment key={group.id}>
            {group.label ? (
              <div className={styles.groupHeader}>
                {group.icon ? (
                  <OverlayMetadataIcon
                    icon={group.icon}
                    items={context.items}
                    toolName={context.toolName}
                    label={group.label}
                    size={16}
                  />
                ) : null}
                <span>{group.label}</span>
              </div>
            ) : null}
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
    </UiPanel>
  );
}

function createControlsMap(
  action: OverlayActionLike | ToolOverlayDefinition["defaults"],
): Map<string, OverlayControlDefinition> {
  const controls = action?.controls;
  return new Map((controls ?? []).map((control) => [control.id, control]));
}

export function OverlayToolbarTools(): React.ReactElement[] {
  return listToolOverlays()
    .slice()
    .sort((left, right) => {
      const familyCompare = (left.family ?? "").localeCompare(
        right.family ?? "",
      );
      if (familyCompare !== 0) {
        return familyCompare;
      }

      return left.label.localeCompare(right.label);
    })
    .map((overlay) => (
      <OverlayToolbarTool key={overlay.toolName} overlay={overlay} />
    ));
}

function OverlayToolbarTool({
  overlay,
}: {
  overlay: ToolOverlayDefinition;
}): React.ReactElement {
  const { board } = useAppContext();
  const { openedMenu, toggleMenu } = useToolsPanelContext();
  const isActive = Boolean(board.tools.getAddRegisteredTool(overlay.toolName));
  const hasDefaults = Boolean(overlay.defaults?.controls.length);
  const isOpen = openedMenu === overlay.toolName && isActive && hasDefaults;
  const controlsById = createControlsMap(overlay.defaults ?? { controls: [] });

  const handleClick = (): void => {
    if (!isActive) {
      board.tools.addRegisteredTool(overlay.toolName, true);
      if (hasDefaults) {
        toggleMenu(overlay.toolName);
      }
      return;
    }

    if (hasDefaults) {
      toggleMenu(overlay.toolName);
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
          active={isActive}
          onClick={handleClick}
          variant="secondary"
          rounded="none"
          className={styles.toolbarButton}
        >
          <OverlayMetadataIcon
            icon={overlay.icon}
            items={[]}
            toolName={overlay.toolName}
            label={overlay.label}
          />
        </UiButton>
      }
    >
      {overlay.defaults ? (
        <OverlayControlsMenu
          controls={overlay.defaults.controls}
          groups={overlay.defaults.groups}
          context={{
            items: [],
            toolName: overlay.toolName,
            controlsById,
          }}
        />
      ) : null}
    </ToolbarButtonWithMenu>
  );
}

function OverlayContextAction({
  action,
  items,
}: {
  action: OverlayActionLike;
  items: BaseItem[];
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
    });
  };

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
          onClick={handleClick}
          active={isOpen}
        >
          <OverlayMetadataIcon
            icon={action.icon}
            items={items}
            label={action.label}
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
        }}
      />
    </ContextButtonWithMenu>
  );
}

export function OverlayContextActions(): React.ReactElement[] {
  const { board } = useAppContext();
  const items = board.selection.items.list() as BaseItem[];
  const actions = [
    ...intersectOverlayActions(items),
    ...getSelectionOverlayActions(items),
  ];

  return actions.map((action) => (
    <OverlayContextAction key={action.id} action={action} items={items} />
  ));
}
