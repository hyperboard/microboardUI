import { App } from "App";
import { Board } from "Board";
import { useAppSubscription } from "Board/useBoardSubscription";
import { useForceUpdate } from "lib/useForceUpdate";
import { UiPanel } from "ViewTalkIntegration/Ui/UiPanel";
import React from "react";
import { UiButton } from "ViewTalkIntegration/Ui/UiButton";
import { Icon } from "ViewTalkIntegration/Icon";
import style from "./ZoomPanel.module.css";

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
				tooltipPosition="top"
				tooltip="Отдалить"
				hotkey="⌘-"
				onClick={handleZoomOut}
			>
				<Icon iconName="Minus" width={20} height={18} />
			</UiButton>
			<UiButton
				tooltipPosition="top"
				tooltip="Масштаб 100%"
				hotkey="⌘0"
				className={style.zoom}
				onClick={handleDefaultZoom}
			>
				{currentScale}%
			</UiButton>
			<UiButton
				tooltipPosition="top-right"
				tooltip="Приблизить"
				hotkey="⌘+"
				onClick={handleZoomIn}
			>
				<Icon iconName="Plus" width={20} height={18} />
			</UiButton>
		</UiPanel>
	);
}
