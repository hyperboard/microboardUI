import {
  buildHierarchyTree,
  getHierarchyItemKind,
  getUnambiguousHierarchyPath,
  selectHierarchyAncestor,
  selectHierarchyItem,
  selectParentInHierarchy,
} from "./hierarchyUi";
import { selectParentHotkeyDefinition } from "./selectParentHotkey";

describe("hierarchy UI helpers", () => {
  test("select parent promotes selection and focuses the parent", () => {
    const zoomToFit = jest.fn();
    const parent = {
      getId: () => "group-1",
      getMbr: jest.fn(() => ({ id: "parent-mbr" })),
    };
    const board = {
      camera: { zoomToFit },
      selection: {
        selectParent: jest.fn(() => parent),
        setContext: jest.fn(),
      },
    } as any;

    const result = selectParentInHierarchy(board);

    expect(result).toBe(parent);
    expect(board.selection.selectParent).toHaveBeenCalled();
    expect(board.selection.setContext).toHaveBeenCalledWith("EditUnderPointer");
    expect(zoomToFit).toHaveBeenCalledWith({ id: "parent-mbr" });
  });

  test("breadcrumb selection selects the ancestor and focuses it", () => {
    const zoomToFit = jest.fn();
    const ancestor = {
      getId: () => "frame-1",
      getWorldMbr: jest.fn(() => ({ id: "world-mbr" })),
      getMbr: jest.fn(() => ({ id: "local-mbr" })),
    };
    const board = {
      camera: { zoomToFit },
      selection: {
        selectAncestorById: jest.fn(() => ancestor),
        setContext: jest.fn(),
      },
    } as any;

    const result = selectHierarchyAncestor(board, "frame-1");

    expect(result).toBe(ancestor);
    expect(board.selection.selectAncestorById).toHaveBeenCalledWith("frame-1");
    expect(board.selection.setContext).toHaveBeenCalledWith("EditUnderPointer");
    expect(zoomToFit).toHaveBeenCalledWith({ id: "world-mbr" });
  });

  test("tree selection updates the board selection state", () => {
    const zoomToFit = jest.fn();
    const item = {
      getId: () => "item-1",
      getMbr: jest.fn(() => ({ id: "item-mbr" })),
    };
    const board = {
      camera: { zoomToFit },
      selection: {
        removeAll: jest.fn(),
        add: jest.fn(),
        setContext: jest.fn(),
      },
    } as any;

    selectHierarchyItem(board, item as any);

    expect(board.selection.removeAll).toHaveBeenCalled();
    expect(board.selection.add).toHaveBeenCalledWith(item);
    expect(board.selection.setContext).toHaveBeenCalledWith("EditUnderPointer");
    expect(zoomToFit).toHaveBeenCalledWith({ id: "item-mbr" });
  });

  test("breadcrumbs only render for a single unambiguous hierarchy path", () => {
    expect(
      getUnambiguousHierarchyPath([
        [
          {
            id: "frame-1",
            itemType: "Frame",
            parentId: null,
            hasChildren: true,
            isCanvasSelectable: true,
          },
        ],
      ] as any),
    ).toHaveLength(1);

    expect(
      getUnambiguousHierarchyPath([
        [
          {
            id: "frame-1",
            itemType: "Frame",
            parentId: null,
            hasChildren: true,
            isCanvasSelectable: true,
          },
        ],
        [
          {
            id: "group-1",
            itemType: "Group",
            parentId: "frame-1",
            hasChildren: true,
            isCanvasSelectable: false,
          },
        ],
      ] as any),
    ).toBeNull();
  });

  test("item tree preserves nested groups, frames, and items", () => {
    const frame = {
      itemType: "Frame",
      parent: "Board",
      getId: () => "frame-1",
      getChildrenIds: () => ["group-1"],
      getRichText: () => ({ getTextString: () => "Planning" }),
    };
    const group = {
      itemType: "Group",
      parent: "frame-1",
      getId: () => "group-1",
      getChildrenIds: () => ["item-1"],
      getRichText: () => null,
    };
    const item = {
      itemType: "Shape",
      parent: "group-1",
      getId: () => "item-1",
      getChildrenIds: () => [],
      getRichText: () => ({ getTextString: () => "Task" }),
    };

    const tree = buildHierarchyTree([frame, group, item]);

    expect(tree).toHaveLength(1);
    expect(tree[0].kind).toBe("frame");
    expect(tree[0].children[0].kind).toBe("group");
    expect(tree[0].children[0].children[0].kind).toBe("item");
    expect(tree[0].children[0].children[0].label).toContain("Task");
  });

  test("groups and frames stay visually distinguishable in the tree model", () => {
    expect(getHierarchyItemKind("Frame")).toBe("frame");
    expect(getHierarchyItemKind("Group")).toBe("group");
    expect(getHierarchyItemKind("Shape")).toBe("item");
  });

  test("the parent-selection hotkey uses shift-enter", () => {
    expect(selectParentHotkeyDefinition.key.button).toBe("Enter");
    expect(selectParentHotkeyDefinition.key.shift).toBe(true);
    expect(selectParentHotkeyDefinition.label.windows).toBe("Shift + Enter");
    expect(selectParentHotkeyDefinition.label.mac).toBe("⇧⏎");
  });
});
