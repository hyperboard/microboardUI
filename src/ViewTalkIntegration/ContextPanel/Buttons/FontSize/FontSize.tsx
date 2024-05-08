import React, { MouseEventHandler, useRef } from "react";
import { ButtonWithMenu } from "ViewTalkIntegration/ContextPanel/Buttons/ButtonWithMenu";
import { usePanelContext } from "ViewTalkIntegration/ContextPanel/PanelContext";
import { Icon } from "ViewTalkIntegration/Icon";
import { FontSizePicker } from "ViewTalkIntegration/Pickers/FontSizePicker/FontSizePicker";
import { UiButton } from "ViewTalkIntegration/Ui/UiButton/UiButton";
import { UiPanel } from "ViewTalkIntegration/Ui/UiPanel/UiPanel";
import { useTalkTranslation } from "ViewTalkIntegration/useTalkTranslation";
import style from "./FontSize.module.css";

const MENU_NAME = "FontSize";

const fontSizes = [10, 12, 14, 18, 24, 36, 48, 64, 80, 144, 288];

export function FontSize() {
	const { board, toggleMenu, openedMenu, panelMbr, windowHeight } =
		usePanelContext();
	const { t } = useTalkTranslation();
	const chevronRef = useRef<HTMLSpanElement>(null);

	const fontSize = board.selection.getFontSize();

	const handleClick = () => {
		toggleMenu(MENU_NAME);
	};

	const handlePick = (size: number) => {
		board.selection.setFontSize(size);
		toggleMenu("None");
	};

	const handleChevronClick: MouseEventHandler = e => {
		e.stopPropagation();

		if (!chevronRef.current) {
			return;
		}

		const rect = chevronRef.current.getBoundingClientRect();
		const midpoint = rect.top + rect.height / 2;

		if (e.clientY < midpoint) {
			if (fontSize >= fontSizes[fontSizes.length - 1]) {
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
					tooltip={t("contextPanel.fontSize.tooltip")}
					tooltipPosition="top"
					className={style.button}
					onClick={handleClick}
				>
					<span className={style.fontSize}>{fontSize}</span>
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
					currentFontSize={fontSize}
					fontSizes={fontSizes}
					onPick={handlePick}
				/>
			</UiPanel>
		</ButtonWithMenu>
	);
}
