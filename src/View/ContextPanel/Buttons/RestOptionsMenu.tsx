import { Board } from "Board";
import { Mbr } from "Board/Items";
import { getHotkeyLabel } from "Board/Keyboard/hotkeys";
import { t } from "i18next";
import React from "react";
import { useTranslation } from "react-i18next";
import { RestMenuIcon } from "View/Icon/RestMenuIcon";
import { UiButton } from "View/Ui/UiButton";
import { ButtonWithMenu } from "./ButtonWithMenu";

type RestOptionsMenuProps = {
	toggleMenu: (menu: string) => void;
	menu: string;
	panelMbr: Mbr;
	windowHeight: number;
	board: Board;
};

export function RestOptionsMenu({
	toggleMenu,
	menu,
	panelMbr,
	windowHeight,
	board,
}: RestOptionsMenuProps): React.ReactElement {
	const menuRef = React.useRef<HTMLDivElement>(null);
	return (
		<>
			<ButtonWithMenu
				panelMbr={panelMbr}
				windowHeight={windowHeight}
				menuRef={menuRef}
			>
				<UiButton
					id="Options"
					onClick={() => toggleMenu("RestMenu")}
					width={32}
					margin={0}
					title={t("contextPanel.restMenu.tooltip")}
				>
					<RestMenuIcon fill="#505050" width={20} height={20} />
				</UiButton>
				<div
					id={"OptionsMenu"}
					ref={menuRef}
					className="ContextPanelMenu"
					style={{
						position: "absolute",
						top: "100%",
						left: 0,
						display: "flex",
						flexDirection: "column",
						visibility: menu === "RestMenu" ? "visible" : "hidden",
					}}
				>
					<BringToFront board={board} toggleMenu={toggleMenu} />
					<BringToBack board={board} toggleMenu={toggleMenu} />
				</div>
			</ButtonWithMenu>
		</>
	);
}

type RestOptionsMenuItemProps = React.PropsWithChildren<{
	hotkey: string;
	onClick: React.MouseEventHandler;
	id: string;
}>;

function RestOptionsMenuItem({
	children,
	hotkey,
	onClick,
	id,
}: RestOptionsMenuItemProps): React.ReactElement {
	return (
		<UiButton
			style={{
				fontSize: "16px",
				display: "flex",
				justifyContent: "space-between",
				padding: "6px 12px",
				color: "rgba(0, 0, 0, .8)",
			}}
			width={210}
			margin={0}
			id={id}
			onClick={onClick}
		>
			<span style={{ whiteSpace: "nowrap" }}>{children}</span>
			<span style={{ color: "rgba(0, 0, 0, .25)" }}>{hotkey}</span>
		</UiButton>
	);
}

type BringToFrontProps = { board: Board; toggleMenu: (menu: string) => void };

function BringToFront({
	board,
	toggleMenu,
}: BringToFrontProps): React.ReactElement | null {
	const { t } = useTranslation();

	const handleClick = () => {
		board.selection.bringToFront();
		toggleMenu("None");
	};
	return (
		<RestOptionsMenuItem
			id="BringToFront"
			onClick={handleClick}
			hotkey={getHotkeyLabel("bringToFront")}
		>
			{t("contextPanel.bringToFront.text")}
		</RestOptionsMenuItem>
	);
}

type BringToBackProps = { board: Board; toggleMenu: (menu: string) => void };

function BringToBack({
	board,
	toggleMenu,
}: BringToBackProps): React.ReactElement | null {
	const { t } = useTranslation();

	const handleClick = () => {
		board.selection.sendToBack();
		toggleMenu("None");
	};
	return (
		<RestOptionsMenuItem
			id="BringToBack"
			onClick={handleClick}
			hotkey={getHotkeyLabel("sendToBack")}
		>
			{t("contextPanel.sendToBack.text")}
		</RestOptionsMenuItem>
	);
}
