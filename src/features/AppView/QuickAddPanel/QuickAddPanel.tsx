import React, { useCallback, useEffect } from "react";
import { Icon, ShapeIcon } from "shared/ui-lib/Icon";
import { BASIC_SHAPES } from "Board/Items/Shape/ShapeData";
import { useAppContext } from "features/AppContext";
import { useAppSubscription } from "App/useBoardSubscription";
import { useForceUpdate } from "shared/lib/useForceUpdate";
import { UiPanel } from "shared/ui-lib/UiPanel";
import { useTranslation } from "react-i18next";
import style from "./QuickAddPanel.module.css";
import { ShapeType } from "Board/Items/Shape";
import { quickAddItem } from "Board/Selection/QuickAddButtons";
import { getHotkeyLabel } from "Board/Keyboard";
import { StarIcon } from "entities/AIInput/StarIcon";
import { UiButton } from "shared/ui-lib/UiButton";

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
	const startPoint = single.getStartPoint();
	if (startPoint.pointType === "Board") {
		return null;
	}
	const startPointItem = startPoint.item;
	const itemToAddType =
		startPointItem.itemType === "Shape"
			? startPointItem.getShapeType()
			: startPointItem.itemType;

	const endPoint = single.getEndPoint();
	const cameraMatrix = appBoard.camera.getMatrix();

	const handlePick = (
		type: ShapeType | "RichText" | "AINode" | "Sticker",
	): void => {
		quickAddItem(appBoard, type, single);
	};

	const shapesButtons = [BASIC_SHAPES[0], ...BASIC_SHAPES.slice(2, 7)].map(
		shape => (
			<UiButton
				id={`quickAdd-${shape}`}
				onClick={() => handlePick(shape)}
				key={`quickAdd-${shape}`}
				size="md"
				variant="secondary"
			>
				<ShapeIcon iconName={shape} width={24} height={24} />
			</UiButton>
		),
	);

	const aiButton = (
		<UiButton
			id={"quickAdd-AINode"}
			onClick={() => handlePick("AINode")}
			key={"quickAdd-AINode"}
			size="md"
			variant="secondary"
		>
			<StarIcon width={24} height={24} />
		</UiButton>
	);

	const textButton = (
		<UiButton
			id={"quickAdd-text"}
			onClick={() => handlePick("RichText")}
			key={"quickAdd-text"}
			size="md"
			variant="secondary"
		>
			<Icon width={24} height={24} iconName={"Text"} />
		</UiButton>
	);

	const stickerButton = (
		<UiButton
			id={"quickAdd-sticker"}
			onClick={() => handlePick("Sticker")}
			key={"quickAdd-sticker"}
			size="md"
			variant="secondary"
		>
			<Icon width={24} height={24} iconName={"Sticker"} />
		</UiButton>
	);

	const gridButtons = [aiButton, textButton, stickerButton, ...shapesButtons];

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
				zIndex: 3,
			}}
			rounded="full"
		>
			<UiButton
				onClick={() => handlePick(itemToAddType)}
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
					{t("quickAdd.panel.sameObj")}
				</div>
				<Icon iconName="Duplicate" width={16} height={16} />
			</UiButton>
			<div className={style.wrapper}>
				<div className={style.panel}>{gridButtons}</div>
			</div>
			{/* <UiAccordion*/}

			{/*	closedHeight={128}*/}
			{/*	openedHeight={300}*/}
			{/*	renderButton={(toggle, isOpen) => (*/}
			{/*		<UiButton*/}
			{/*			onClick={toggle}*/}
			{/*			variant="tertiary"*/}
			{/*			size="sm"*/}
			{/*			style={{ maxWidth: "96px" }}*/}
			{/*		>*/}
			{/*			{isOpen*/}
			{/*				? t("toolsPanel.addText.showBasic")*/}
			{/*				: t("toolsPanel.addText.showAll")}*/}
			{/*		</UiButton>*/}
			{/*	)}*/}
			{/* >*/}

			{/* </UiAccordion>*/}
		</UiPanel>
	);
}
