import { useAppSubscription } from "App/useBoardSubscription";
import { useAppContext } from "features/AppContext";
import { useForceUpdate } from "shared/lib/useForceUpdate";
import { Icon, type IconId } from "shared/ui-lib/Icon";
import React, { useState } from "react";
import type { Item } from "microboard-temp";
import { useTranslation } from "react-i18next";
import style from "./BoardItemsList.module.css";

const EXCLUDED_TYPES = new Set(["Placeholder", "Mbr", "Point", "Anchor"]);

const ITEM_TYPE_ICON: Record<string, IconId> = {
  Frame: "Frame",
  RichText: "Text",
  Shape: "Shape",
  Image: "Image",
  Connector: "Connector",
  Audio: "Audio",
  Drawing: "Pen",
  Arc: "Shape",
  Line: "Connector",
  Curve: "Connector",
  Group: "Stack",
  Sticker: "Sticker",
};

function getItemText(item: Item): string {
  return (item as any).getRichText?.()?.getTextString?.()?.trim() ?? "";
}

function getItemLabel(item: Item, index: number): string {
  const text = getItemText(item);
  return text ? `${item.itemType} ${text}` : `${item.itemType} ${index + 1}`;
}

function getChildren(item: Item): Item[] {
  return (item as any).index?.items.listAll() ?? [];
}

function itemMatchesQuery(item: Item, query: string): boolean {
  const q = query.toLowerCase();
  const text = getItemText(item).toLowerCase();
  return text.includes(q) || item.itemType.toLowerCase().includes(q);
}

interface ItemRowProps {
  item: Item;
  index: number;
  depth: number;
  onNavigate: (item: Item) => void;
}

function ItemRow({
  item,
  index,
  depth,
  onNavigate,
}: ItemRowProps): React.JSX.Element {
  const children = getChildren(item).filter(
    (c) => !EXCLUDED_TYPES.has(c.itemType),
  );
  const hasChildren = children.length > 0;
  const [isExpanded, setIsExpanded] = useState(true);
  const iconName: IconId = ITEM_TYPE_ICON[item.itemType] ?? "Select";
  const label = getItemLabel(item, index);

  return (
    <>
      <div
        className={style.row}
        style={{ paddingLeft: 8 + depth * 16 }}
        onMouseEnter={() => (item as any).highlightMbr?.()}
        onMouseLeave={() => (item as any).clearHighlightMbr?.()}
      >
        <button
          className={style.item}
          onClick={() => onNavigate(item)}
          title={label}
        >
          <Icon
            iconName={iconName}
            width={14}
            height={14}
            className={style.typeIcon}
          />
          <span className={style.label}>{label}</span>
        </button>
        {hasChildren && (
          <button
            className={style.chevronBtn}
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded((v) => !v);
            }}
          >
            <Icon
              iconName={isExpanded ? "StrokeChevronUp" : "StrokeChevronDown"}
              width={12}
              height={12}
            />
          </button>
        )}
      </div>
      {hasChildren &&
        isExpanded &&
        children.map((child, i) => (
          <ItemRow
            key={(child as any).getId?.() ?? i}
            item={child}
            index={i}
            depth={depth + 1}
            onNavigate={onNavigate}
          />
        ))}
    </>
  );
}

interface SearchItemRowProps {
  item: Item;
  query: string;
  onNavigate: (item: Item) => void;
}

function SearchItemRow({
  item,
  query,
  onNavigate,
}: SearchItemRowProps): React.JSX.Element {
  const iconName: IconId = ITEM_TYPE_ICON[item.itemType] ?? "Select";
  const text = getItemText(item);
  const lowerQ = query.toLowerCase();

  const highlightedLabel = (): React.ReactNode => {
    if (!text) return <span className={style.label}>{item.itemType}</span>;
    const lowerText = text.toLowerCase();
    const idx = lowerText.indexOf(lowerQ);
    if (idx === -1)
      return <span className={style.label}>{`${item.itemType} ${text}`}</span>;
    const full = `${item.itemType} `;
    return (
      <span className={style.label}>
        {full}
        {text.slice(0, idx)}
        <mark className={style.highlight}>
          {text.slice(idx, idx + query.length)}
        </mark>
        {text.slice(idx + query.length)}
      </span>
    );
  };

  return (
    <div
      className={style.row}
      style={{ paddingLeft: 8 }}
      onMouseEnter={() => (item as any).highlightMbr?.()}
      onMouseLeave={() => (item as any).clearHighlightMbr?.()}
    >
      <button
        className={style.item}
        onClick={() => onNavigate(item)}
        title={text || item.itemType}
      >
        <Icon
          iconName={iconName}
          width={14}
          height={14}
          className={style.typeIcon}
        />
        {highlightedLabel()}
      </button>
    </div>
  );
}

interface BoardItemsListProps {
  query?: string;
}

export function BoardItemsList({
  query = "",
}: BoardItemsListProps): React.JSX.Element {
  const { board } = useAppContext();
  const forceUpdate = useForceUpdate();
  const { t } = useTranslation();

  useAppSubscription({
    subjects: ["items"],
    observer: forceUpdate,
  });

  const handleNavigate = (item: Item): void => {
    board.camera.zoomToFit(item.getMbr());
  };

  if (query.trim()) {
    const q = query.trim();
    const matched = board.items
      .listAll()
      .filter(
        (item) =>
          !EXCLUDED_TYPES.has(item.itemType) && itemMatchesQuery(item, q),
      );

    if (matched.length === 0) {
      return <div className={style.empty}>{t("sidePanel.itemsNotFound")}</div>;
    }

    return (
      <div className={style.list}>
        {matched.map((item, i) => (
          <SearchItemRow
            key={(item as any).getId?.() ?? i}
            item={item}
            query={q}
            onNavigate={handleNavigate}
          />
        ))}
      </div>
    );
  }

  const topLevelItems = board.items
    .listAll()
    .filter(
      (item) =>
        !EXCLUDED_TYPES.has(item.itemType) && (item as any).parent === "Board",
    );

  if (topLevelItems.length === 0) {
    return <div className={style.empty}>{t("sidePanel.itemsEmpty")}</div>;
  }

  return (
    <div className={style.list}>
      {topLevelItems.map((item, index) => (
        <ItemRow
          key={(item as any).getId?.() ?? index}
          item={item}
          index={index}
          depth={0}
          onNavigate={handleNavigate}
        />
      ))}
    </div>
  );
}
