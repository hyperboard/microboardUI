import React from "react";
import { Icon, ShapeIcon } from "View/Icon";
import { BASIC_SHAPES } from "View/Tools/AddShape";
import { UiButton } from "View/Ui/UiButton/UiButton";
import { useAppContext } from "View/AppContext";
import { useAppSubscription } from "Board/useBoardSubscription";
import { useForceUpdate } from "lib/useForceUpdate";
import { UiPanel } from "View/Ui/UiPanel";
import { UiAccordion } from "View/Ui/UiAccordion";
import { useTranslation } from "react-i18next";
import style from "./QuickAddPanel.module.css";
import { ShapeType } from "Board/Items/Shape";
import { quickAddItem } from "Board/Selection/QuickAddButtons";
import { getHotkeyLabel } from "Board/Keyboard";

export function QuickAddPanel(): React.ReactElement | null {
	const { app } = useAppContext();
	const { t } = useTranslation();
	const forceUpdate = useForceUpdate();
	useAppSubscription({
		subjects: ["selection", "camera"],
		observer: () => {
			forceUpdate();
		},
	});
	const appBoard = app.getBoard();
	const single = appBoard.selection.items.getSingle();
	if (
		!appBoard.selection.showQuickAddPanel ||
		!single ||
		single.itemType !== "Connector"
	) {
		return null;
	}

	const endPoint = single.getEndPoint();
	const cameraMatrix = appBoard.camera.getMatrix();

	const handlePick = (type: ShapeType | "copy"): void => {
		quickAddItem(appBoard, type, single);
	};

	return (
		<UiPanel
			style={{
				position: "absolute",
				left:
					endPoint.x * cameraMatrix.scaleX + cameraMatrix.translateX,
				top: endPoint.y * cameraMatrix.scaleY + cameraMatrix.translateY,
				transform: "translate(-50%, -50%)",
				display: "flex",
				flexDirection: "column",
			}}
			rounded="full"
		>
			<UiButton
				onClick={() => handlePick("copy")}
				size="md"
				variant="tertiary"
				style={{
					maxHeight: "52px",
					width: "96px",
					display: "flex",
					gap: "2px",
				}}
				tooltip={getHotkeyLabel("confirm")}
				tooltipPosition="top"
			>
				<div
					style={{
						maxWidth: "56px",
						padding: "6px 0px",
					}}
				>
					Same object
				</div>
				<Icon iconName="Duplicate" width={16} height={16} />
			</UiButton>
			<UiAccordion
				className={style.wrapper}
				contentClassName={style.panel}
				closedHeight={128}
				openedHeight={300}
				renderButton={(toggle, isOpen) => (
					<UiButton
						onClick={toggle}
						variant="tertiary"
						size="sm"
						style={{ maxWidth: "96px" }}
					>
						{isOpen
							? t("toolsPanel.addText.showBasic")
							: t("toolsPanel.addText.showAll")}
					</UiButton>
				)}
			>
				{BASIC_SHAPES.map(shape => (
					<UiButton
						id={`quickAdd-${shape}`}
						onClick={() => handlePick(shape)}
						key={`quickAdd-${shape}`}
						size="md"
						variant="secondary"
					>
						<ShapeIcon iconName={shape} width={24} height={24} />
					</UiButton>
				))}
			</UiAccordion>
		</UiPanel>
	);
}
