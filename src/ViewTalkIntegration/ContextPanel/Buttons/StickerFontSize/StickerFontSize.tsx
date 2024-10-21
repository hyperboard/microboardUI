import React, { MouseEventHandler, useRef } from "react";
import { usePanelContext } from "ViewTalkIntegration/ContextPanel/PanelContext";
import { Icon } from "ViewTalkIntegration/Icon";
import { FontSizePicker } from "ViewTalkIntegration/Pickers/FontSizePicker/FontSizePicker";
import { UiButton } from "ViewTalkIntegration/Ui/UiButton/UiButton";
import { ButtonWithMenu } from "ViewTalkIntegration/ContextPanel/Buttons/ButtonWithMenu";
import { UiPanel } from "ViewTalkIntegration/Ui/UiPanel/UiPanel";
import style from "./FontSize.module.css";
import { useTalkTranslation } from "ViewTalkIntegration/useTalkTranslation";

const MENU_NAME = "FontSize";

const fontSizes = [4, 8, 12, 16, 20, 24, 32, 40, 48, 64];

export function StickerFontSize() {
	const { board, toggleMenu, openedMenu, panelMbr, windowHeight } =
		usePanelContext();

	const { t } = useTalkTranslation();
	const chevronRef = useRef<HTMLSpanElement>(null);

	const fontSize = board.selection.getFontSize();
	const text = board.selection.getText();
	const maxFontSize = text?.getMaxFontSize();
	const isAuto = text?.getAutosize();

	const handleClick = () => {
		toggleMenu(MENU_NAME);
	};

	const handlePick = (size: number) => {
		board.selection.setFontSize(size);
		toggleMenu("None");
	};
	const handleAutoSizePick = () => {
		board.selection.setFontSize("auto");
		toggleMenu("None");
	};

	const handleChevronClick: MouseEventHandler = e => {
		e.stopPropagation();

		if (!chevronRef.current) {
			console.log("return");
			return;
		}
		const rect = chevronRef.current.getBoundingClientRect();
		const midpoint = rect.top + rect.height / 2;

		if (e.clientY < midpoint) {
			if (fontSize >= (fontSizes.at(-1) ?? 64)) {
				return;
			}
			board.selection.setFontSize(fontSize + 1);
		} else {
			if (fontSize <= fontSizes[0]) {
				return;
			}
			board.selection.setFontSize(fontSize - 1);
		}
	};

	return (
		<ButtonWithMenu
			menuName={MENU_NAME}
			openedMenu={openedMenu}
			panelMbr={panelMbr}
			windowHeight={windowHeight}
			align="left"
			button={
				<UiButton
					id={"sticker-font-size"}
					tooltip={t("contextPanel.fontSize.tooltip")}
					tooltipPosition="top"
					className={style.button}
					onClick={handleClick}
				>
					<span className={style.fontSize}>
						{isAuto ? t("contextPanel.fontSize.auto") : fontSize}
					</span>
					<span
						ref={chevronRef}
						onClick={handleChevronClick}
						className={style.chevron}
					>
						<Icon width={10} height={16} iconName="UpDownArrow" />
					</span>
				</UiButton>
			}
		>
			<UiPanel vertical className={style.sizeList}>
				<FontSizePicker
					id="sticker-font"
					currentFontSize={fontSize}
					fontSizes={fontSizes}
					onPick={handlePick}
					isAutoSize={isAuto}
					max={maxFontSize}
					onAutoSizePick={handleAutoSizePick}
				/>
			</UiPanel>
		</ButtonWithMenu>
	);
}
