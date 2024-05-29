import { App } from "App";
import { Board } from "Board";
import { useAppSubscription } from "Board/useBoardSubscription";
import { useForceUpdate } from "lib/useForceUpdate";
import { UiPanel } from "ViewTalkIntegration/Ui/UiPanel/UiPanel";
import React from "react";
import { UiButton } from "ViewTalkIntegration/Ui/UiButton/UiButton";
import { Icon } from "ViewTalkIntegration/Icon";
import style from "./ZoomPanel.module.css";
import { useTalkTranslation } from "ViewTalkIntegration/useTalkTranslation";
import { getHotkeyLabel } from "Board/Keyboard";

type Props = {
	app: App;
	board: Board;
};

export function ZoomPanel({ app, board }: Props) {
	const forceUpdate = useForceUpdate();
	useAppSubscription(app, {
		subjects: ["camera"],
		observer: forceUpdate,
	});
	const { t } = useTalkTranslation();

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
		<UiPanel className={style.panel}>
			<UiButton
				id={"zoom-out"}
				tooltipPosition="top"
				tooltip={t("zoomPanel.zoomOut.tooltip")}
				hotkey={getHotkeyLabel("zoomOut")}
				onClick={handleZoomOut}
			>
				<Icon iconName="Minus" width={20} height={18} />
			</UiButton>
			<UiButton
				id={"zoom-default"}
				tooltipPosition="top"
				tooltip={t("zoomPanel.zoomDefault.tooltip")}
				hotkey={getHotkeyLabel("zoomDefault")}
				className={style.zoom}
				onClick={handleDefaultZoom}
			>
				{currentScale}%
			</UiButton>
			<UiButton
				id={"zoom-in"}
				tooltipPosition="top-right"
				tooltip={t("zoomPanel.zoomIn.tooltip")}
				hotkey={getHotkeyLabel("zoomIn")}
				onClick={handleZoomIn}
			>
				<Icon iconName="Plus" width={20} height={18} />
			</UiButton>
		</UiPanel>
	);
}
