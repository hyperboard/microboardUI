import { App } from "App";
import { Board } from "Board";
import { useAppSubscription } from "Board/useBoardSubscription";
import { useForceUpdate } from "lib/useForceUpdate";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { SidePanelCloseIcon } from "View/Icon/SidePanelCloseIcon";
import { SidePanelOpenIcon } from "View/Icon/SidePanelOpenIcon";
import { Modal } from "View/Modal/Modal";
import { SidePanelState } from "View/SidePanel/SidePanelState";
import { UiButton } from "View/Ui/UiButton";
import { ExportButton } from "./ExportButton";
import "./TitlePanel.css";

type Props = {
	board: Board;
	sidePanelState: SidePanelState;
	app: App;
};

export function TitlePanel({ sidePanelState, board, app }: Props) {
	const [isModalVisible, setIsModalVisible] = React.useState(false);
	const forceUpdate = useForceUpdate();
	const { t } = useTranslation();
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

	React.useEffect(() => {
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
		<div id="TitlePanel" className="TitlePanel">
			<SidePanelButton
				isOpen={isSidePanelOpen}
				toggle={toggleSidePanel}
			/>
			<UiButton
				id="Microboard"
				title={t("appTitle")}
				onClick={() => {}}
				width={80}
			>
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
			<ExportButton board={board} />
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
