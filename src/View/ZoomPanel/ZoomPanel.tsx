import * as React from "react";
import { Icon } from "View/Icon";
import { App } from "App";
import { Board } from "Board";
import { UiButton } from "View/Ui/UiButton";
import { useForceUpdate } from "lib/useForceUpdate";
import { useAppSubscription } from "Board/useBoardSubscription";
import { useTranslation } from "react-i18next";
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
	const { t } = useTranslation();

	const zoomToFit = (): void => {
		const items = board.items.listAll();
		if (items.length > 0) {
			const rect = board.items.getMbr();
			board.camera.zoomToFit(rect);
		}
	};

	const zoomIn = (): void => {
		board.camera.zoomInToViewCenter();
	};

	const zoomOut = (): void => {
		board.camera.zoomOutFromViewCenter();
	};

	const defaultZoom = (): void => {
		board.camera.zoomToViewCenter(1);
	};

	const scale = board.camera.getScale();

	return (
		<div
			id="ZoomPanel"
			style={{
				display: "flex",
				position: "absolute",
				zIndex: "90",
				bottom: "8px",
				right: "8px",
				backgroundColor: "white",
				borderRadius: "4px",
				boxShadow: "0 8px 16px 0 rgba(0, 0, 0, 0.12)",
				paddingLeft: "4px",
				paddingRight: "4px",
				userSelect: "none",
			}}
		>
			<UiButton
				id="ZoomPanelZoomToFit"
				title={t("zoomPanel.zoomToFit.tooltip")}
				onClick={zoomToFit}
				tipOnTop
				margin={0}
			>
				<Icon name="ZoomToFit" width={24} height={24} />
			</UiButton>
			<UiButton
				id="ZoomPanelZoomOut"
				title={t("zoomPanel.zoomOut.tooltip")}
				hotkey={getHotkeyLabel("zoomOut")}
				onClick={zoomOut}
				tipOnTop
				margin={0}
			>
				<Icon name="ZoomOut" width={24} height={24} />
			</UiButton>
			<UiButton
				id="ZoomPanelZoomTo100"
				title={t("zoomPanel.zoomDefault.tooltip")}
				onClick={defaultZoom}
				hotkey={getHotkeyLabel("zoomDefault")}
				tipOnTop
				margin={0}
			>
				{scale < 0.01 ? "<1%" : `${Math.round(scale * 100)}%`}
			</UiButton>
			<UiButton
				id="ZoomPanelZoomIn"
				title={t("zoomPanel.zoomIn.tooltip")}
				hotkey={getHotkeyLabel("zoomIn")}
				onClick={zoomIn}
				tipOnTop
				margin={0}
			>
				<Icon name="ZoomIn" width={24} height={24} />
			</UiButton>
		</div>
	);
}
