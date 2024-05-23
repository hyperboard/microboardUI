import type { App } from "App";
import type { Board } from "Board";
import { UiButton } from "ViewTalkIntegration/Ui/UiButton";
import type { SidePanelState } from "ViewTalkIntegration/SidePanelState";
import { UiPanel } from "ViewTalkIntegration/Ui/UiPanel";
import React, { useEffect, useState } from "react";
import { useTalkTranslation } from "ViewTalkIntegration/useTalkTranslation";
import { SidePanelCloseIcon } from "View/Icon/SidePanelCloseIcon";
import { SidePanelOpenIcon } from "View/Icon/SidePanelOpenIcon";
import { useTranslation } from "react-i18next";
import { useForceUpdate } from "lib/useForceUpdate";
import { useAppSubscription } from "Board/useBoardSubscription";
import style from "./TitlePanel.module.css";
import { Link } from "react-router-dom";
import { isIframe } from "lib/isIframe";
import { Modal } from "View/Modal/Modal";

type Props = {
	board: Board;
	sidePanelState: SidePanelState;
	app: App;
};

export function TitlePanel({ app, board, sidePanelState }: Props) {
	const [isModalVisible, setIsModalVisible] = useState(false);
	const forceUpdate = useForceUpdate();
	const { t } = useTalkTranslation();
	const isSidePanelOpen = sidePanelState.isOn;
	const toggleSidePanel = () => {
		sidePanelState.toggle();
	};
	const openModal = () => {
		setIsModalVisible(true);
	};
	const closeModal = () => {
		setIsModalVisible(false);
	};

	useAppSubscription(app, { observer: forceUpdate, subjects: ["tools"] });

	useEffect(() => {
		sidePanelState.subject.subscribe(forceUpdate);

		return () => {
			sidePanelState.subject.unsubscribe(forceUpdate);
		};
	}, [forceUpdate]);

	const isExport = board.tools.getExport();
	if (isExport) {
		return null;
	}

	return (
		<UiPanel className={style.panel}>
			<SidePanelButton
				isOpen={isSidePanelOpen}
				toggle={toggleSidePanel}
			/>
			<UiButton title={t("appTitle")}>
				{!isIframe() ? (
					<Link
						to={"/dashboard"}
						style={{
							display: "inline-block",
							color: "black",
							textDecoration: "none",
							paddingLeft: "4px",
							paddingRight: "4px",
							fontWeight: 600,
						}}
					>
						{t("appTitle")}
					</Link>
				) : (
					<span
						style={{
							display: "inline-block",
							color: "black",
							textDecoration: "none",
							paddingLeft: "4px",
							paddingRight: "4px",
							fontWeight: 600,
						}}
					>
						{t("appTitle")}
					</span>
				)}
			</UiButton>
			<span
				onClick={openModal}
				style={{
					maxWidth: 100,
					textOverflow: "ellipsis",
					whiteSpace: "nowrap",
					margin: "auto",
					overflow: "hidden",
					cursor: "pointer",
				}}
			>
				{board?.getBoardId()}
				{isModalVisible && (
					<Modal boardLink={location.href} closeModal={closeModal} />
				)}
			</span>
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
	const IconComponent = isOpen ? SidePanelCloseIcon : SidePanelOpenIcon;

	if (isIframe) {
		return <></>;
	}
	return (
		<UiButton
			id={isOpen ? "CloseSidePanel" : "OpenSidePanel"}
			title={
				isOpen ? t("titlePanel.menu.close") : t("titlePanel.menu.open")
			}
			onClick={toggle}
		>
			<IconComponent width={24} height={24} />
		</UiButton>
	);
}
