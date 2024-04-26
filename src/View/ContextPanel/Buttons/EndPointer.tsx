import { Board } from "Board";
import { Mbr } from "Board/Items";
import React from "react";
import { useTranslation } from "react-i18next";
import { PointerIcon } from "View/Icon/PointerIcon";
import { ConnectorEndPointerPicker } from "View/Pickers/ConnectorPointerPicker";
import { UiButton } from "View/Ui/UiButton";
import { ButtonWithMenu } from "./ButtonWithMenu";

const IconSize = 24;

type EndPointerProps = {
	board: Board;
	toggleMenu: (menu: string) => void;
	menu: string;
	panelMbr: Mbr;
	windowHeight: number;
	pointer: string;
};

export function EndPointer({
	board,
	toggleMenu,
	menu,
	panelMbr,
	windowHeight,
	pointer,
}: EndPointerProps): React.ReactElement | null {
	const { t } = useTranslation();
	const menuRef = React.useRef<HTMLDivElement>(null);

	const canChangePointer = board.selection.items.isItemTypes(["Connector"]);
	if (
		board.selection.getContext() === "SelectUnderPointer" ||
		!canChangePointer
	) {
		return null;
	}

	const handleClick = () => {
		toggleMenu("EndPointer");
	};

	const handlePick = (type: string) => {
		board.selection.setEndPointerStyle(type);
		toggleMenu("None");
	};

	return (
		<ButtonWithMenu
			panelMbr={panelMbr}
			windowHeight={windowHeight}
			menuRef={menuRef}
		>
			<UiButton
				id="ChangeEndPointer"
				onClick={handleClick}
				title={t("contextPanel.connectorEndPointer.tooltip")}
			>
				<PointerIcon
					type={pointer}
					width={IconSize}
					height={IconSize}
				/>
			</UiButton>
			<div
				id="EndPointerMenu"
				ref={menuRef}
				className="ContextPanelMenu"
				style={{
					width: "110px",
					marginLeft: "-50px",
					visibility: menu === "EndPointer" ? "visible" : "hidden",
				}}
			>
				<ConnectorEndPointerPicker
					onPick={handlePick}
				></ConnectorEndPointerPicker>{" "}
			</div>
		</ButtonWithMenu>
	);
}
