import { useDomMbr } from "Board/Items/Mbr/useDomMbr";
import { useAppContext } from "View/AppContext";
import { PanelContext } from "View/ContextPanel/PanelContext";
import { Tooltip } from "View/Ui/UiButton/Tooltip";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

export function ItemTooltip(): JSX.Element {
	const { app, board } = useAppContext();
	const { t } = useTranslation();
	const { items, camera } = board;
	const [openedMenu, setOpenedMenu] = useState("HoverUnderPointer");
	const panelRef = useRef<HTMLDivElement>(null);

	const placeholders = items
		.getUnderPointer()
		.filter(item => item.itemType === "Placeholder");
	const mbr = useDomMbr({
		app,
		board,
		ref: panelRef,
		subjects: undefined,
		targetMbr: placeholders[0]?.getMbr(),
	});

	const toggleMenu = (menu: string) => {
		setOpenedMenu(prev => (prev === menu ? "HoverUnderPointer" : menu));
	};

	const windowHeight = board.camera.window.height;

	const isHoverUnderPointer =
		board.selection.getContext() === "HoverUnderPointer";

	const isPlaceholder = placeholders.length === 1;

	const placeholderMbr = placeholders[0]
		?.getMbr()
		.getTransformed(camera.getMatrix());
	const tooltipPosition =
		placeholderMbr && placeholderMbr.bottom < mbr.top ? "bottom" : "top";

	return (
		<PanelContext.Provider
			value={{
				openedMenu,
				panelMbr: mbr,
				toggleMenu,
				windowHeight,
			}}
		>
			{isHoverUnderPointer && isPlaceholder && (
				<Tooltip
					tooltipAlign={"left"}
					tooltip={t("itemTooltips.placeholder")}
					borderRadius="radiusMd"
					padding="paddingMd"
					style={{
						display: "flex",
						position: "absolute",
						left: mbr.left,
						top: mbr.top,
						height: "fit-content",
					}}
					ref={panelRef}
					tooltipPosition={tooltipPosition}
				/>
			)}
		</PanelContext.Provider>
	);
}
