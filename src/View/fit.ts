import { Mbr } from "Board/Items";

export function fitContextPanel(selection: Mbr, view: Mbr, panel: Mbr): Mbr {
	const topSpace = selection.top - view.top;
	const bottomSpace = view.bottom - selection.bottom;
	const panelHeight = panel.getHeight();
	const panelOffset = panelHeight * 1.3;
	const newPanel = new Mbr();
	if (topSpace > bottomSpace - panelHeight) {
		newPanel.top = selection.top - panelOffset - panelHeight;
		if (newPanel.top < view.top) {
			newPanel.top = view.top + panelOffset;
		}
	} else {
		newPanel.top = selection.bottom + panelOffset;
		if (newPanel.top + panelHeight > view.bottom) {
			newPanel.top = view.bottom - (panelHeight + panelOffset);
		}
	}
	newPanel.bottom = newPanel.top + panelHeight;
	const itemCenter = selection.getCenter();
	const panelWidth = panel.getWidth();
	newPanel.left = itemCenter.x - panelWidth / 2;
	newPanel.right = newPanel.left + panelWidth;
	if (newPanel.left < view.left + panelOffset) {
		newPanel.left = view.left + panelOffset;
		newPanel.right = newPanel.left + panelWidth;
	} else if (newPanel.right + panelOffset > view.right) {
		newPanel.right = view.right - panelOffset;
		newPanel.left = view.right - (panelOffset + panelWidth);
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
