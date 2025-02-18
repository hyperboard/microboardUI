import { Camera } from "Board/Camera";
import { Mbr } from "Board/Items";

export function getContextPanelRect(
	selectionMbr: Mbr,
	camera: Camera,
	panel: HTMLElement,
	toLeft: boolean,
	horizontalOffset?: number,
	verticalOffset?: number,
): Mbr {
	const transformedMbr = selectionMbr.getTransformed(camera.getMatrix());
	const windowMbr = camera.window.getMbr();
	const panelRectFromDom = Mbr.fromDomRect(panel.getBoundingClientRect());

	const panelRect = toLeft
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

	return panelRect;
}

export function fitContextPanelToLeft(
	selectionMbr: Mbr,
	view: Mbr,
	panel: Mbr,
	verticalOffset = 40,
	horizontalOffset = 80,
): Mbr {
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

	const itemMbr = selectionMbr.getMbr();
	newPanel.left = itemMbr.left;
	adjustPanelHorizontal(newPanel, panelWidth, view, horizontalOffset);

	return newPanel;
}

export function fitContextPanelToCenter(
	selectionMbr: Mbr,
	view: Mbr,
	panel: Mbr,
	verticalOffset = 40,
	horizontalOffset = 80,
): Mbr {
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
): void {
	newPanel.right = newPanel.left + panelWidth;
	if (newPanel.left < view.left + horizontalOffset) {
		newPanel.left = view.left + horizontalOffset;
	} else if (newPanel.right + horizontalOffset > view.right) {
		newPanel.left = view.right - (panelWidth + horizontalOffset);
	}
	newPanel.right = newPanel.left + panelWidth;
}

export function fitContextMenu(
	button: Mbr,
	view: Mbr,
	menu: Mbr,
	panel: Mbr,
): Mbr {
	const height = menu.getHeight();
	const width = menu.getWidth();
	const center = button.getCenter();
	const fit = new Mbr();
	fit.top = panel.bottom + 1;
	fit.bottom = fit.top + height;
	if (fit.bottom > view.bottom) {
		fit.bottom = panel.top - 1;
		fit.top = fit.bottom - height;
	}
	fit.left = center.x - width / 2;
	fit.right = fit.left + width;
	if (fit.left < panel.left) {
		fit.left = panel.left;
		fit.right = fit.left + width;
	} else if (fit.right > view.right) {
		fit.right = view.right;
		fit.left = view.right - width;
	}
	return fit;
}

export function fitOnLeftOrRightOfItem(
	item: Mbr,
	view: Mbr,
	bounds: Mbr,
	offset: number,
): Mbr {
	const leftSpace = item.left - view.left;
	const rightSpace = view.right - item.right;
	const height = bounds.getHeight();
	const width = bounds.getWidth();
	const itemCenter = item.getCenter();
	const fit = new Mbr(0, 0, 0, 0);
	if (leftSpace > rightSpace - width) {
		fit.left = item.left - offset - width;
		if (fit.left < view.left) {
			fit.left = view.left + offset;
		}
	} else {
		fit.left = item.right + offset;
		if (fit.left + width > view.right) {
			fit.left = view.right - (width + offset);
		}
	}
	fit.right = fit.left + width;
	fit.top = itemCenter.y - height / 2;
	fit.bottom = fit.top + height;
	if (fit.top < view.top + offset) {
		fit.top = view.top + offset;
		fit.bottom = fit.top + height;
	} else if (fit.bottom + offset > view.bottom) {
		fit.bottom = view.bottom - offset;
		fit.top = view.bottom - (offset + height);
	}

	return fit;
}

export function fitLinkToBtn(
	itemMbr: Mbr,
	view: Mbr,
	panel: Mbr,
	verticalOffset = -2,
	horizontalOffset = -2,
): Mbr {
	const panelHeight = panel.getHeight();
	const newPanel = new Mbr();

	newPanel.top = itemMbr.top - panelHeight - verticalOffset;

	newPanel.top = newPanel.top + panelHeight;
	newPanel.bottom = newPanel.top + panelHeight * 2;

	const panelWidth = panel.getWidth();

	newPanel.left = itemMbr.right - panelWidth + horizontalOffset;

	return newPanel;
}

export function fitComment(
	anchor: Mbr,
	panel: Mbr,
	verticalOffset = 0,
	horizontalOffset = 0,
): Mbr {
	const panelHeight = panel.getHeight();
	const newPanel = new Mbr();
	newPanel.top = anchor.top - panelHeight - verticalOffset;
	newPanel.bottom = newPanel.top + panelHeight;
	const panelWidth = panel.getWidth();
	newPanel.left = anchor.left - panelWidth / 2 - horizontalOffset;
	newPanel.right = newPanel.left + panelWidth;

	return newPanel;
}

export function fitBoardMenu(
	anchor: Mbr,
	view: Mbr,
	panel: Mbr,
	verticalOffset = 20,
	horizontalOffset = 20,
): Mbr {
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

export function fitThreadPanel(
	anchor: Mbr,
	view: Mbr,
	panel: Mbr,
	verticalOffset = 50,
	horizontalOffset = 50,
): Mbr {
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

export function fitOnTopOrBottomOfItem(
	item: Mbr,
	view: Mbr,
	bounds: Mbr,
	offset: number,
): Mbr {
	const topSpace = item.top - view.top;
	const bottomSpace = view.bottom - item.bottom;
	const height = bounds.getHeight();
	const width = bounds.getWidth();
	const center = item.getCenter();
	const fit = new Mbr();
	if (topSpace > bottomSpace - height) {
		fit.top = item.top - offset - height;
		if (fit.top < view.top) {
			fit.top = view.top + offset;
		}
	} else {
		fit.top = item.bottom + offset;
		if (fit.top + height > view.bottom) {
			fit.top = view.bottom - (height + offset);
		}
	}
	fit.bottom = fit.top + height;
	fit.left = center.x - width / 2;
	fit.right = fit.left + width;
	if (fit.left < view.left + offset) {
		fit.left = view.left + offset;
		fit.right = fit.left + width;
	} else if (fit.right + offset > view.right) {
		fit.right = view.right - offset;
		fit.left = view.right - (offset + width);
	}
	return fit;
}
