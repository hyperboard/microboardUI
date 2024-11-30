import { useAccount } from "App/useAccount";
import { useBoardsList } from "App/useBoardsList";
import clsx from "clsx";
import { useClickOutside } from "lib/useClickOutside";
import React, { useState, type MouseEventHandler } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "shared/ui-lib/Button";
import { useContextMenuContext } from "View/ContextMenu";
import { Folder } from "View/Folder";
import { Icon } from "View/Icon";
import { useModal } from "View/Modal/ModalProvider";
import { UiButton } from "View/Ui/UiButton";
import { Tooltip } from "View/Ui/UiButton/Tooltip";
import { UiPanel } from "View/Ui/UiPanel";
import { ResizableEdge } from "./ResizableEdge";
import style from "./SidePanel.module.css";
import { useSidePanelContext } from "./SidePanelContext";

const MIN_PANEL_WIDTH = 280;

export function SidePanel(): JSX.Element {
	const { isOpen, toggleSideMenu, isHighlighted } = useSidePanelContext();
	const { open, close } = useContextMenuContext();
	const { t } = useTranslation();
	const [width, setWidth] = useState(300);
	const account = useAccount();
	const boardsList = useBoardsList();

	const { showModal } = useModal();

	const panelRef = useClickOutside(() => {
		close();
	});

	const handleContextMenuOpen: MouseEventHandler = event => {
		event.preventDefault();
		close();
		open(event.clientX, event.clientY);
	};

	const handleAddNewMenu: MouseEventHandler<HTMLButtonElement> = ev => {
		ev.preventDefault();
		ev.stopPropagation();

		const MENU_Y_POS_OFFSET = -85;
		const buttonRect = ev.currentTarget.getBoundingClientRect();
		open(ev.clientX, buttonRect.top + MENU_Y_POS_OFFSET);
	};

	const newWidth = width <= MIN_PANEL_WIDTH ? MIN_PANEL_WIDTH : width;
	return (
		<UiPanel
			ref={panelRef}
			onContextMenu={handleContextMenuOpen}
			padding={0}
			className={clsx(style.sidePanel, {
				[style.open]: isOpen,
				[style.highlited]: isHighlighted,
			})}
			style={{ width: newWidth }}
		>
			<div className={style.content}>
				<div className={style.header}>
					<h3 className={style.title}>{t("sidePanel.title")}</h3>
					<UiButton
						onClick={toggleSideMenu}
						variant="secondary"
						className={style.close}
					>
						<Icon iconName="Close" />
					</UiButton>
				</div>
				<div className={style.folders}>
					<Folder folder={boardsList.getRootFolder()} />
					<Folder folder={boardsList.getSharedFolder()} />
				</div>
			</div>
			<div className={style.bottom}>
				<button className={style.add} onClick={handleAddNewMenu}>
					<Icon iconName="Plus" width={16} height={16} />
					<span>{t("sidePanel.addNew")}</span>
				</button>
				<Button
					id={"miro"}
					pattern="primary"
					onClick={() => showModal("startImportMiro")}
					disabled={!account.isLoggedIn}
					className={style.importMiroBtn}
				>
					<Icon
						iconName="miro"
						width={16}
						height={16}
						style={{ color: "#050038" }}
					/>
					<span>{t("miro.importMiroBtn")}</span>
					<Tooltip
						tooltip={
							!account.isLoggedIn
								? t("miro.authTooltip")
								: t("miro.tooltipClipboardImport")
						}
						tooltipPosition="top-center-fixed"
						tooltipAlign="left"
					/>
				</Button>
			</div>
			<ResizableEdge panelWidth={width} setWidth={setWidth} />
		</UiPanel>
	);
}
