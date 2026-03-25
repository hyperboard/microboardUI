import { Board, Mbr, RichText } from "microboard-temp";
import type { RefObject } from "react";

export type UpdateRectsFit =
  | "contextPanel"
  | "linkToBtn"
  | "comment"
  | "threadPanel"
  | "boardMenu"
  | "hyperLink";

export function updateRects(
  board: Board,
  ref: RefObject<HTMLElement | null>,
  targetMbr?: Mbr,
  verticalOffset?: number,
  horizontalOffset?: number,
  fit: UpdateRectsFit = "contextPanel",
) {
  const panel = ref.current;
  const selectionMbr = targetMbr ?? board.selection.getMbr();
  const selectionItems = board.selection.items;
  const richTextSelection =
    selectionItems.getSingle() instanceof RichText
      ? selectionItems.list()[0]
      : undefined;

  if (!panel || !selectionMbr) {
    return null;
  }

  if (fit === "contextPanel") {
    return getContextPanelRect(
      selectionMbr,
      board.camera,
      panel,
      Boolean(richTextSelection),
      horizontalOffset,
      verticalOffset,
    );
  }

  const transformedSelectionMbr = selectionMbr.getTransformed(
    board.camera.getMatrix(),
  );
  const panelRect = Mbr.fromDomRect(panel.getBoundingClientRect());
  const windowMbr = board.camera.window.getMbr();

  if (fit === "linkToBtn") {
    return fitLinkToBtn(
      transformedSelectionMbr,
      panelRect,
      verticalOffset,
      horizontalOffset,
    );
  }

  if (fit === "comment") {
    return fitComment(
      transformedSelectionMbr,
      panelRect,
      verticalOffset,
      horizontalOffset,
    );
  }

  if (fit === "threadPanel") {
    return fitThreadPanel(
      transformedSelectionMbr,
      windowMbr,
      panelRect,
      verticalOffset,
      horizontalOffset,
    );
  }

  if (fit === "boardMenu") {
    return fitBoardMenu(
      transformedSelectionMbr,
      windowMbr,
      panelRect,
      verticalOffset,
      horizontalOffset,
    );
  }

  if (fit === "hyperLink") {
    return fitHyperLink(transformedSelectionMbr, panelRect);
  }

  return null;
}

function getContextPanelRect(
  selectionMbr: Mbr,
  camera: Board["camera"],
  panel: HTMLElement,
  toLeft: boolean,
  horizontalOffset?: number,
  verticalOffset?: number,
) {
  const transformedMbr = selectionMbr.getTransformed(camera.getMatrix());
  const windowMbr = camera.window.getMbr();
  const panelRectFromDom = Mbr.fromDomRect(panel.getBoundingClientRect());

  return toLeft
    ? fitContextPanelToLeft(
        transformedMbr,
        windowMbr,
        panelRectFromDom,
        verticalOffset,
        horizontalOffset,
      )
    : fitContextPanelToCenter(
        transformedMbr,
        windowMbr,
        panelRectFromDom,
        verticalOffset,
        horizontalOffset,
      );
}

function fitContextPanelToLeft(
  selectionMbr: Mbr,
  view: Mbr,
  panel: Mbr,
  verticalOffset = 40,
  horizontalOffset = 80,
) {
  const panelHeight = panel.getHeight();
  const panelWidth = panel.getWidth();
  const newPanel = new Mbr();
  const topSpace = selectionMbr.top - view.top;
  const hasEnoughTopSpace = topSpace >= panelHeight + verticalOffset;

  if (hasEnoughTopSpace) {
    newPanel.top = selectionMbr.top - panelHeight - verticalOffset;
    if (newPanel.top < view.top) {
      newPanel.top = view.top + verticalOffset;
    }
  } else {
    const usePanelTop =
      panel.top > 1 && panel.top > selectionMbr.top + verticalOffset;
    newPanel.top = usePanelTop
      ? panel.top
      : selectionMbr.bottom + verticalOffset;
    const isOverflowingBottom = newPanel.top + panelHeight > view.bottom;
    const isLargeOffsetForRichText =
      newPanel.top >= selectionMbr.bottom + verticalOffset * 2;

    if (isOverflowingBottom || isLargeOffsetForRichText) {
      newPanel.top = selectionMbr.bottom - (panelHeight + verticalOffset);
    }
  }

  newPanel.bottom = newPanel.top + panelHeight;
  fitContextPanelInViewRect(newPanel, view, verticalOffset);
  const itemMbr = selectionMbr.getMbr();
  newPanel.left = itemMbr.left;
  adjustPanelHorizontal(newPanel, panelWidth, view, horizontalOffset);
  return newPanel;
}

function fitContextPanelToCenter(
  selectionMbr: Mbr,
  view: Mbr,
  panel: Mbr,
  verticalOffset = 40,
  horizontalOffset = 80,
) {
  const panelHeight = panel.getHeight();
  const panelWidth = panel.getWidth();
  const newPanel = new Mbr();
  const topSpace = selectionMbr.top - view.top;
  const bottomSpace = view.bottom - selectionMbr.bottom;
  const shouldPlaceAbove = topSpace > bottomSpace - panelHeight;

  if (shouldPlaceAbove) {
    newPanel.top = selectionMbr.top - panelHeight - verticalOffset;
    if (newPanel.top < view.top) {
      newPanel.top = view.top + verticalOffset;
    }
  } else {
    newPanel.top = selectionMbr.bottom + verticalOffset;
    const isOverflowingBottom = newPanel.top + panelHeight > view.bottom;
    const isLargeOffsetForRichText =
      newPanel.top >= selectionMbr.bottom + verticalOffset * 2;

    if (isOverflowingBottom || isLargeOffsetForRichText) {
      newPanel.top = selectionMbr.bottom - (panelHeight + verticalOffset);
    }
  }

  newPanel.bottom = newPanel.top + panelHeight;
  fitContextPanelInViewRect(newPanel, view, verticalOffset);
  const itemCenter = selectionMbr.getCenter();
  newPanel.left = itemCenter.x - panelWidth / 2;
  adjustPanelHorizontal(newPanel, panelWidth, view, horizontalOffset);
  return newPanel;
}

function adjustPanelHorizontal(
  newPanel: Mbr,
  panelWidth: number,
  view: Mbr,
  horizontalOffset: number,
) {
  newPanel.right = newPanel.left + panelWidth;

  if (newPanel.left < view.left + horizontalOffset) {
    newPanel.left = view.left + horizontalOffset;
  } else if (newPanel.right + horizontalOffset > view.right) {
    newPanel.left = view.right - (panelWidth + horizontalOffset);
  }

  newPanel.right = newPanel.left + panelWidth;
}

function fitContextPanelInViewRect(
  panel: Mbr,
  view: Mbr,
  verticalOffset: number,
) {
  const panelHeight = panel.getHeight();

  if (panel.top <= view.top + verticalOffset) {
    panel.top = view.top + 2 * verticalOffset;
    panel.bottom = panel.top + panelHeight;
  }

  if (panel.bottom >= view.bottom - verticalOffset) {
    panel.bottom = view.bottom - 2 * verticalOffset;
    panel.top = panel.bottom - panelHeight;
  }
}

function fitLinkToBtn(
  itemMbr: Mbr,
  panel: Mbr,
  verticalOffset = -2,
  horizontalOffset = -2,
) {
  const panelHeight = panel.getHeight();
  const newPanel = new Mbr();
  newPanel.top = itemMbr.top - panelHeight - verticalOffset;
  newPanel.top += panelHeight;
  newPanel.bottom = newPanel.top + panelHeight * 2;
  const panelWidth = panel.getWidth();
  newPanel.left = itemMbr.right - panelWidth + horizontalOffset;
  return newPanel;
}

function fitHyperLink(linkMbr: Mbr, panel: Mbr) {
  const panelHeight = panel.getHeight();
  const newPanel = new Mbr();
  newPanel.top = linkMbr.bottom;
  newPanel.bottom = panelHeight + newPanel.top;
  const panelWidth = panel.getWidth();
  newPanel.left = linkMbr.left;
  newPanel.right = newPanel.left + panelWidth;
  return newPanel;
}

function fitComment(
  anchor: Mbr,
  panel: Mbr,
  verticalOffset = 0,
  horizontalOffset = 0,
) {
  const panelHeight = panel.getHeight();
  const newPanel = new Mbr();
  newPanel.top = anchor.top - panelHeight - verticalOffset;
  newPanel.bottom = newPanel.top + panelHeight;
  const panelWidth = panel.getWidth();
  newPanel.left = anchor.left - panelWidth / 2 - horizontalOffset;
  newPanel.right = newPanel.left + panelWidth;
  return newPanel;
}

function fitBoardMenu(
  anchor: Mbr,
  view: Mbr,
  panel: Mbr,
  verticalOffset = 20,
  horizontalOffset = 20,
) {
  const panelHeight = panel.getHeight();
  const panelWidth = panel.getWidth();
  const newPanel = new Mbr();
  newPanel.top = anchor.top;
  newPanel.bottom = newPanel.top + panelHeight;

  if (newPanel.bottom > view.bottom - verticalOffset) {
    newPanel.bottom = view.bottom - verticalOffset;
    newPanel.top = newPanel.bottom - panelHeight;
  }

  newPanel.left = anchor.left;
  newPanel.right = newPanel.left + panelWidth;

  if (newPanel.right > view.right - horizontalOffset) {
    newPanel.right = view.right - horizontalOffset;
    newPanel.left = newPanel.right - panelWidth;
  }

  return newPanel;
}

function fitThreadPanel(
  anchor: Mbr,
  view: Mbr,
  panel: Mbr,
  verticalOffset = 50,
  horizontalOffset = 50,
) {
  const panelHeight = panel.getHeight();
  const panelWidth = panel.getWidth();
  const newPanel = new Mbr();
  newPanel.top = anchor.top - panelHeight / 2;

  if (newPanel.top < view.top + verticalOffset) {
    newPanel.top = view.top + verticalOffset;
  }

  newPanel.bottom = newPanel.top + panelHeight;

  if (newPanel.bottom > view.bottom - verticalOffset) {
    newPanel.bottom = view.bottom - verticalOffset;
    newPanel.top = newPanel.bottom - panelHeight;
  }

  newPanel.left = anchor.left;
  newPanel.right = newPanel.left + panelWidth;

  if (newPanel.right > view.right - horizontalOffset) {
    newPanel.right = anchor.right;
    newPanel.left = newPanel.right - panelWidth;
  }

  return newPanel;
}
