import { useAppSubscription } from "Board/useBoardSubscription";
import { isIframe } from "lib/isIframe";
import { useForceUpdate } from "lib/useForceUpdate";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Modal } from "View/Modal/Modal";
import { useAppContext } from "ViewUpdate/AppContext";
import { Icon, Logo } from "ViewUpdate/Icon";
import { useSidePanelContext } from "ViewUpdate/SidePanel/SidePanelContext";
import { UiButton } from "ViewUpdate/Ui/UiButton";
import { UiPanel } from "ViewUpdate/Ui/UiPanel";
import { UiSeparator } from "ViewUpdate/Ui/UiSeparator";
import style from "./TitlePanel.module.css";

export function TitlePanel() {
	const [isModalVisible, setIsModalVisible] = useState(false);
	const forceUpdate = useForceUpdate();
	const { t } = useTranslation();
	const { app, board } = useAppContext();
	const { isOpen, toggleSideMenu } = useSidePanelContext();

	const openModal = () => {
		setIsModalVisible(true);
	};
	const closeModal = () => {
		setIsModalVisible(false);
	};

	useAppSubscription(app, { observer: forceUpdate, subjects: ["tools"] });

	const isExport = board.tools.getExport();
	if (isExport) {
		return null;
	}

	const openExport = () => {
		board.tools.export();
	};

	return (
		<UiPanel className={style.panel} padding={0} zIndex={10}>
			<SidePanelButton isOpen={isOpen} toggle={toggleSideMenu} />
			<UiSeparator vertical />
			<UiButton rounded="none" variant="secondary">
				{!isIframe() ? (
					<Link className={style.logo} to={"/dashboard"}>
						<Logo />
						<span>{t("appTitle")}</span>
					</Link>
				) : (
					<span className={style.logo}>{t("appTitle")}</span>
				)}
			</UiButton>
			<UiSeparator vertical />
			<UiButton variant="secondary" rounded="none" onClick={openModal}>
				<span className={style.name}>
					{board?.getBoardId()}
					{isModalVisible && (
						<Modal
							boardLink={location.href}
							closeModal={closeModal}
						/>
					)}
				</span>
			</UiButton>
			<UiSeparator vertical />
			<UiButton
				onClick={openExport}
				variant="secondary"
				rounded="right"
				tooltip={t("export.tooltip")}
				tooltipPosition="bottom"
			>
				<Icon iconName="Export" />
			</UiButton>
		</UiPanel>
	);
}

function SidePanelButton({
	isOpen,
	toggle,
}: {
	isOpen: boolean;
	toggle: () => void;
}): React.ReactElement {
	const { t } = useTranslation();
	const isIframe = window.self !== window.top;

	if (isIframe) {
		return <></>;
	}
	return (
		<UiButton
			id={isOpen ? "CloseSidePanel" : "OpenSidePanel"}
			tooltip={
				isOpen ? t("titlePanel.menu.close") : t("titlePanel.menu.open")
			}
			tooltipPosition="bottom-left"
			onClick={toggle}
			variant="secondary"
			rounded="left"
		>
			<Icon iconName={isOpen ? "SidePanelClose" : "SidePanelOpen"} />
		</UiButton>
	);
}
