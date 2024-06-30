import { getHotkeyLabel } from "Board/Keyboard";
import { useAppSubscription } from "Board/useBoardSubscription";
import { useAppContext } from "View/AppContext";
import { Icon } from "View/Icon";
import { UiButton } from "View/Ui/UiButton/UiButton";
import { UiPanel } from "View/Ui/UiPanel/UiPanel";
import { UiSeparator } from "View/Ui/UiSeparator";
import { useForceUpdate } from "lib/useForceUpdate";
import React from "react";
import { useTranslation } from "react-i18next";
import style from "./ZoomPanel.module.css";

export function ZoomPanel() {
	const { app, board } = useAppContext();
	const forceUpdate = useForceUpdate();
	useAppSubscription(app, {
		subjects: ["camera"],
		observer: forceUpdate,
	});
	const { t } = useTranslation();

	const zoomToFit = (): void => {
		const items = board.items.listAll();
		if (items.length > 0) {
			const rect = board.items.getMbr();
			board.camera.zoomToFit(rect);
		}
	};

	const handleZoomIn = () => {
		board.camera.zoomInToViewCenter();
	};
	const handleZoomOut = () => {
		board.camera.zoomOutFromViewCenter();
	};
	const handleDefaultZoom = () => {
		board.camera.zoomToViewCenter(1);
	};

	const scale = board.camera.getScale();
	const currentScale = scale < 0.01 ? 1 : Math.round(scale * 100);

	return (
		<UiPanel className={style.panel} padding={0}>
			<UiButton
				id="zoom-to-fit"
				tooltip={t("zoomPanel.zoomToFit.tooltip")}
				tooltipPosition="top"
				onClick={zoomToFit}
				variant="secondary"
				rounded="left"
			>
				<Icon iconName="ZoomToFit" />
			</UiButton>
			<UiSeparator vertical />
			<UiButton
				id={"zoom-out"}
				tooltipPosition="top"
				tooltip={t("zoomPanel.zoomOut.tooltip")}
				hotkey={getHotkeyLabel("zoomOut")}
				onClick={handleZoomOut}
				variant="secondary"
				rounded="none"
			>
				<Icon iconName="Minus" />
			</UiButton>
			<UiButton
				id={"zoom-default"}
				tooltipPosition="top"
				tooltip={t("zoomPanel.zoomDefault.tooltip")}
				hotkey={getHotkeyLabel("zoomDefault")}
				className={style.zoom}
				onClick={handleDefaultZoom}
				variant="secondary"
				rounded="none"
			>
				{currentScale}%
			</UiButton>
			<UiButton
				id={"zoom-in"}
				tooltipPosition="top-right"
				tooltip={t("zoomPanel.zoomIn.tooltip")}
				hotkey={getHotkeyLabel("zoomIn")}
				onClick={handleZoomIn}
				variant="secondary"
				rounded="right"
			>
				<Icon iconName="Plus" />
			</UiButton>
		</UiPanel>
	);
}
