import { Mbr, RichText } from "Board/Items";

export function fitContextPanel(
	selectionMbr: Mbr,
	view: Mbr,
	panel: Mbr,
	offset = 40,
	richTextSelection?: RichText,
): Mbr {
	const topSpace = selectionMbr.top - view.top;
	const bottomSpace = view.bottom - selectionMbr.bottom;
	const panelHeight = panel.getHeight();
	const newPanel = new Mbr();

	const shouldPlaceAbove =
		topSpace > bottomSpace - panelHeight ||
		(richTextSelection && topSpace >= panelHeight + offset);

	if (shouldPlaceAbove) {
		newPanel.top = selectionMbr.top - panelHeight - offset;
		if (newPanel.top < view.top) {
			newPanel.top = view.top + offset;
		}
	} else {
		if (
			panel.top > 1 &&
			panel.top > selectionMbr.top + offset &&
			richTextSelection
		) {
			newPanel.top = panel.top;
		} else {
			newPanel.top = selectionMbr.bottom + offset;
		}

		const isOverflowingBottom = newPanel.top + panelHeight > view.bottom;
		const isLargeOffsetForRichText =
			richTextSelection &&
			newPanel.top >= selectionMbr.bottom + offset * 2;

		if (isOverflowingBottom || isLargeOffsetForRichText) {
			newPanel.top = selectionMbr.bottom - (panelHeight + offset);
		}
	}

	newPanel.bottom = newPanel.top + panelHeight;
	const panelWidth = panel.getWidth();

	if (richTextSelection) {
		const itemMbr = selectionMbr.getMbr();
		newPanel.left = itemMbr.left;
	} else {
		const itemCenter = selectionMbr.getCenter();
		newPanel.left = itemCenter.x - panelWidth / 2;
	}

	newPanel.right = newPanel.left + panelWidth;
	if (newPanel.left < view.left + offset) {
		newPanel.left = view.left + offset;
		newPanel.right = newPanel.left + panelWidth;
	} else if (newPanel.right + offset > view.right) {
		newPanel.right = view.right - offset;
		newPanel.left = view.right - (panelWidth + offset);
	}
	return newPanel;
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
