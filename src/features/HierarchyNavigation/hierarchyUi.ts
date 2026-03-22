import type { Board, Item, SelectionHierarchyNode } from "microboard-temp";

const EXCLUDED_TYPES = new Set(["Placeholder", "Mbr", "Point", "Anchor"]);

export type HierarchyNodeKind = "frame" | "group" | "item";

export interface HierarchyTreeSource {
  itemType: string;
  parent: string;
  getId(): string;
  getChildrenIds?: () => string[] | null;
  getRichText?: () => {
    getTextString?: () => string;
  } | null;
}

export interface HierarchyTreeNode<T extends HierarchyTreeSource> {
  id: string;
  item: T;
  label: string;
  kind: HierarchyNodeKind;
  children: HierarchyTreeNode<T>[];
}

export function getHierarchyItemKind(itemType: string): HierarchyNodeKind {
  if (itemType === "Frame") {
    return "frame";
  }
  if (itemType === "Group") {
    return "group";
  }
  return "item";
}

export function getHierarchyItemText(
  item: Pick<HierarchyTreeSource, "getRichText">,
): string {
  return item.getRichText?.()?.getTextString?.()?.trim() ?? "";
}

export function getHierarchyItemLabel(
  item: Pick<HierarchyTreeSource, "itemType" | "getRichText">,
  index: number,
): string {
  const text = getHierarchyItemText(item);
  return text ? `${item.itemType} ${text}` : `${item.itemType} ${index + 1}`;
}

export function itemMatchesHierarchyQuery(
  item: Pick<HierarchyTreeSource, "itemType" | "getRichText">,
  query: string,
): boolean {
  const q = query.toLowerCase();
  return (
    item.itemType.toLowerCase().includes(q) ||
    getHierarchyItemText(item).toLowerCase().includes(q)
  );
}

export function getUnambiguousHierarchyPath(
  paths: SelectionHierarchyNode[][],
): SelectionHierarchyNode[] | null {
  return paths.length === 1 ? paths[0] : null;
}

export function buildHierarchyTree<T extends HierarchyTreeSource>(
  items: T[],
): HierarchyTreeNode<T>[] {
  const filteredItems = items.filter(
    (item) => !EXCLUDED_TYPES.has(item.itemType),
  );
  const itemsById = new Map(filteredItems.map((item) => [item.getId(), item]));
  const childrenByParent = new Map<string, T[]>();

  for (const item of filteredItems) {
    const siblings = childrenByParent.get(item.parent) ?? [];
    siblings.push(item);
    childrenByParent.set(item.parent, siblings);
  }

  const buildNode = (
    item: T,
    index: number,
    visited: Set<string>,
  ): HierarchyTreeNode<T> => {
    const itemId = item.getId();
    if (visited.has(itemId)) {
      return {
        id: itemId,
        item,
        label: getHierarchyItemLabel(item, index),
        kind: getHierarchyItemKind(item.itemType),
        children: [],
      };
    }

    const nextVisited = new Set(visited);
    nextVisited.add(itemId);

    const explicitChildIds = item.getChildrenIds?.() ?? [];
    const explicitChildren = explicitChildIds
      .map((childId) => itemsById.get(childId))
      .filter((child): child is T => !!child);
    const implicitChildren = (childrenByParent.get(itemId) ?? []).filter(
      (child) => !explicitChildIds.includes(child.getId()),
    );
    const orderedChildren = [...explicitChildren, ...implicitChildren];

    return {
      id: itemId,
      item,
      label: getHierarchyItemLabel(item, index),
      kind: getHierarchyItemKind(item.itemType),
      children: orderedChildren.map((child, childIndex) =>
        buildNode(child, childIndex, nextVisited),
      ),
    };
  };

  return (childrenByParent.get("Board") ?? []).map((item, index) =>
    buildNode(item, index, new Set<string>()),
  );
}

function getViewportMbr(item: Item) {
  return (
    (
      item as Item & { getWorldMbr?: () => ReturnType<Item["getMbr"]> }
    ).getWorldMbr?.() ?? item.getMbr()
  );
}

export function selectHierarchyItem(board: Board, item: Item): Item {
  board.selection.removeAll();
  board.selection.add(item);
  board.selection.setContext("EditUnderPointer");
  board.camera.zoomToFit(getViewportMbr(item));
  return item;
}

export function selectHierarchyAncestor(
  board: Board,
  ancestorId: string,
): Item | null {
  const ancestor = board.selection.selectAncestorById(ancestorId);
  if (!ancestor) {
    return null;
  }

  board.selection.setContext("EditUnderPointer");
  board.camera.zoomToFit(getViewportMbr(ancestor));
  return ancestor;
}

export function selectParentInHierarchy(board: Board): Item | null {
  const parent = board.selection.selectParent();
  if (!parent) {
    return null;
  }

  board.selection.setContext("EditUnderPointer");
  board.camera.zoomToFit(getViewportMbr(parent));
  return parent;
}
