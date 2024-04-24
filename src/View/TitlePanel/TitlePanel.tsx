import * as React from "react";
import { Link, useParams } from "react-router-dom";
import { Board } from "Board";
import { SidePanelState } from "View/SidePanel/SidePanelState";
import { UiButton } from "View/Ui/UiButton";
import { SidePanelOpenIcon } from "View/Icon/SidePanelOpenIcon";
import { SidePanelCloseIcon } from "View/Icon/SidePanelCloseIcon";
import { useStyle } from "View";
import { ExportBoardSnapshotButton } from "App/ExportBoardSnapshot";
import { Modal } from "View/Modal/Modal";
import { isIframe } from "lib/isIframe";
import Cookies from "js-cookie";
import { useForceUpdate } from "lib/useForceUpdate";
import { useTranslation } from "react-i18next";
import "./TitlePanel.css";

type Props = {
	board: Board;
	sidePanelState: SidePanelState;
};

export function TitlePanel({ sidePanelState, board }: Props) {
	const [isModalVisible, setIsModalVisible] = React.useState(false);
	const forceUpdate = useForceUpdate();
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

	React.useEffect(() => {
		sidePanelState.subject.subscribe(forceUpdate);

		return () => {
			sidePanelState.subject.unsubscribe(forceUpdate);
		};
	}, [forceUpdate]);
	return (
		<div id="TitlePanel" className="TitlePanel">
			<SidePanelButton
				isOpen={isSidePanelOpen}
				toggle={toggleSidePanel}
			/>
			<UiButton
				id="Microboard"
				title="Microboard"
				onClick={() => {}}
				width={80}
			>
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
						{"Microboard"}
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
						{"Microboard"}
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
			<ExportBoardSnapshotButton board={board} />
		</div>
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
			tipOnBottomLeft={true}
		>
			<IconComponent width={24} height={24} />
		</UiButton>
	);
}
