import { useAppSubscription } from "App/useBoardSubscription";
import { useAppContext } from "features/AppContext";
import {
  buildHierarchyTree,
  getHierarchyItemKind,
  getHierarchyItemText,
  itemMatchesHierarchyQuery,
  selectHierarchyItem,
  type HierarchyTreeNode,
} from "features/HierarchyNavigation/hierarchyUi";
import React, { useEffect, useMemo, useState } from "react";
import type { Item } from "microboard-temp";
import { useTranslation } from "react-i18next";
import { useForceUpdate } from "shared/lib/useForceUpdate";
import { Icon, type IconId } from "shared/ui-lib/Icon";
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

interface ItemRowProps {
  node: HierarchyTreeNode<Item>;
  depth: number;
  expandedIds: Set<string>;
  selectedIds: Set<string>;
  onNavigate: (item: Item) => void;
  onToggle: (itemId: string) => void;
}

function ItemRow({
  node,
  depth,
  expandedIds,
  selectedIds,
  onNavigate,
  onToggle,
}: ItemRowProps): React.JSX.Element {
  const { item, children, kind, label } = node;
  const hasChildren = children.length > 0;
  const isExpanded = expandedIds.has(node.id);
  const iconName: IconId = ITEM_TYPE_ICON[item.itemType] ?? "Select";
  const isSelected = selectedIds.has(node.id);

  return (
    <>
      <div
        className={style.row}
        data-kind={kind}
        data-selected={isSelected || undefined}
        style={{ paddingLeft: 8 + depth * 16 }}
        onMouseEnter={() => (item as any).highlightMbr?.()}
        onMouseLeave={() => (item as any).clearHighlightMbr?.()}
      >
        <button
          className={style.item}
          data-selected={isSelected || undefined}
          onClick={() => onNavigate(item)}
          title={label}
        >
          <Icon
            iconName={iconName}
            width={14}
            height={14}
            className={style.typeIcon}
          />
          <span className={style.kindBadge} data-kind={kind} aria-hidden="true">
            {kind}
          </span>
          <span className={style.label}>{label}</span>
        </button>
        {hasChildren && (
          <button
            className={style.chevronBtn}
            onClick={(event) => {
              event.stopPropagation();
              onToggle(node.id);
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
        children.map((child) => (
          <ItemRow
            key={child.id}
            node={child}
            depth={depth + 1}
            expandedIds={expandedIds}
            selectedIds={selectedIds}
            onNavigate={onNavigate}
            onToggle={onToggle}
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
  const text = getHierarchyItemText(item);
  const lowerQ = query.toLowerCase();
  const kind = getHierarchyItemKind(item.itemType);

  const highlightedLabel = (): React.ReactNode => {
    if (!text) {
      return <span className={style.label}>{item.itemType}</span>;
    }

    const lowerText = text.toLowerCase();
    const idx = lowerText.indexOf(lowerQ);
    if (idx === -1) {
      return <span className={style.label}>{`${item.itemType} ${text}`}</span>;
    }

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
      data-kind={kind}
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
        <span className={style.kindBadge} data-kind={kind} aria-hidden="true">
          {kind}
        </span>
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
    subjects: ["items", "selectionItems"],
    observer: forceUpdate,
  });

  const items = board.items.listAll() as Item[];
  const tree = useMemo(() => buildHierarchyTree(items), [items]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () =>
      new Set(
        tree.filter((node) => node.children.length > 0).map((node) => node.id),
      ),
  );

  const selectedIds = new Set<string>(
    board.selection.list().map((item) => item.getId()),
  );
  const selectionPathIds = board.selection
    .getSelectionHierarchyPaths()
    .flatMap((path) => path.map((node) => node.id));

  useEffect(() => {
    if (expandedIds.size > 0 || tree.length === 0) {
      return;
    }

    setExpandedIds(
      new Set<string>(
        tree.filter((node) => node.children.length > 0).map((node) => node.id),
      ),
    );
  }, [expandedIds.size, tree]);

  useEffect(() => {
    if (selectionPathIds.length === 0) {
      return;
    }

    setExpandedIds((prev) => new Set<string>([...prev, ...selectionPathIds]));
  }, [selectionPathIds.sort().join(":")]);

  const handleNavigate = (item: Item): void => {
    selectHierarchyItem(board, item);
  };

  const handleToggle = (itemId: string): void => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  if (query.trim()) {
    const q = query.trim();
    const matched = items.filter(
      (item) =>
        !EXCLUDED_TYPES.has(item.itemType) &&
        itemMatchesHierarchyQuery(item, q),
    );

    if (matched.length === 0) {
      return <div className={style.empty}>{t("sidePanel.itemsNotFound")}</div>;
    }

    return (
      <div className={style.list}>
        {matched.map((item, index) => (
          <SearchItemRow
            key={(item as any).getId?.() ?? index}
            item={item}
            query={q}
            onNavigate={handleNavigate}
          />
        ))}
      </div>
    );
  }

  if (tree.length === 0) {
    return <div className={style.empty}>{t("sidePanel.itemsEmpty")}</div>;
  }

  return (
    <div className={style.list}>
      {tree.map((node) => (
        <ItemRow
          key={node.id}
          node={node}
          depth={0}
          expandedIds={expandedIds}
          selectedIds={selectedIds}
          onNavigate={handleNavigate}
          onToggle={handleToggle}
        />
      ))}
    </div>
  );
}
