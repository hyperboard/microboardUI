import { ButtonWithMenu } from "ViewUpdate/ContextPanel/Buttons/ButtonWithMenu";
import { usePanelContext } from "ViewUpdate/ContextPanel/PanelContext";
import { Icon } from "ViewUpdate/Icon";
import { FontSizePicker } from "ViewUpdate/Pickers/FontSizePicker/FontSizePicker";
import { UiButton } from "ViewUpdate/Ui/UiButton/UiButton";
import { UiPanel } from "ViewUpdate/Ui/UiPanel/UiPanel";
import React, { MouseEventHandler, useRef } from "react";
import { useTranslation } from "react-i18next";
import style from "./FontSize.module.css";
import { useAppContext } from "ViewUpdate/AppContext";

const MENU_NAME = "FontSize";

const fontSizes = [4, 8, 12, 16, 20, 24, 32, 40, 48, 64];

export function StickerFontSize() {
	const { toggleMenu, openedMenu, panelMbr, windowHeight } =
		usePanelContext();
	const { board } = useAppContext();
	const { t } = useTranslation();
	const chevronRef = useRef<HTMLSpanElement>(null);

	const fontSize = board.selection.getFontSize();
	const text = board.selection.getText();
	const maxFontSize = text?.getMaxFontSize();
	const isAuto = text?.getAutosize();

	const handleClick = () => {
		toggleMenu(MENU_NAME);
	};

	const handlePick = (size: number) => {
		text?.autosizeDisable();
		board.selection.setFontSize(size);
		toggleMenu("None");
	};
	const handleAutoSizePick = () => {
		text?.autosizeEnable();
	};

	const handleChevronClick: MouseEventHandler = e => {
		e.stopPropagation();

		if (!chevronRef.current || !maxFontSize) {
			return;
		}

		text?.autosizeDisable();

		const rect = chevronRef.current.getBoundingClientRect();
		const midpoint = rect.top + rect.height / 2;

		if (e.clientY < midpoint) {
			if (fontSize >= maxFontSize) {
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
					max={maxFontSize}
					onAutoSizePick={handleAutoSizePick}
				/>
			</UiPanel>
		</ButtonWithMenu>
	);
}
