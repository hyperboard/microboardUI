import { Board } from "Board";
import { Mbr } from "Board/Items";
import React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "View/Icon";
import { ConnectorLineStylePicker } from "View/Pickers/ConnectorLineStylePicker";
import { UiButton } from "View/Ui/UiButton";
import { ButtonWithMenu } from "./ButtonWithMenu";

const IconSize = 24;

type ConnectorTypeProps = {
	board: Board;
	toggleMenu: (menu: string) => void;
	menu: string;
	panelMbr: Mbr;
	windowHeight: number;
};

export function ConnectorType({
	board,
	toggleMenu,
	menu,
	panelMbr,
	windowHeight,
}: ConnectorTypeProps): React.ReactElement | null {
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
		toggleMenu("ConnectorType");
	};

	const handlePick = (type: string) => {
		board.selection.setConnectorLineStyle(type);
		toggleMenu("None");
	};

	return (
		<ButtonWithMenu
			panelMbr={panelMbr}
			windowHeight={windowHeight}
			menuRef={menuRef}
		>
			<UiButton
				id="ChangeConnectorType"
				onClick={handleClick}
				title={t("contextPanel.connectorType.tooltip")}
			>
				<Icon name="curved" width={IconSize} height={IconSize} />
			</UiButton>
			<div
				id="ConnectorTypeMenu"
				ref={menuRef}
				className="ContextPanelMenu"
				style={{
					width: "100px",
					marginLeft: "-50px",
					visibility: menu === "ConnectorType" ? "visible" : "hidden",
				}}
			>
				<ConnectorLineStylePicker
					onPick={handlePick}
				></ConnectorLineStylePicker>
			</div>
		</ButtonWithMenu>
	);
}
