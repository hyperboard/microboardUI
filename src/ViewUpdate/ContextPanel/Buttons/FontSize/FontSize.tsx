import { ButtonWithMenu } from "ViewUpdate/ContextPanel/Buttons/ButtonWithMenu";
import { usePanelContext } from "ViewUpdate/ContextPanel/PanelContext";
import { Icon } from "ViewUpdate/Icon";
import { FontSizePicker } from "ViewUpdate/Pickers/FontSizePicker/FontSizePicker";
import { UiButton } from "ViewUpdate/Ui/UiButton/UiButton";
import { UiPanel } from "ViewUpdate/Ui/UiPanel/UiPanel";
import clsx from "clsx";
import React, { MouseEventHandler, useRef } from "react";
import { useTranslation } from "react-i18next";
import style from "./FontSize.module.css";
import { useAppContext } from "ViewUpdate/AppContext";

const MENU_NAME = "FontSize";

const fontSizes = [10, 12, 14, 18, 24, 36, 48, 64, 80, 144, 288];

type Props = {
	rounded?: "none" | "left";
};

export function FontSize({ rounded = "none" }: Props) {
	const { toggleMenu, openedMenu, panelMbr, windowHeight } =
		usePanelContext();
	const { board } = useAppContext();
	const { t } = useTranslation();
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
			button={verticalAlign => (
				<UiButton
					id="pick-font-size"
					tooltip={t("contextPanel.fontSize.tooltip")}
					tooltipPosition="top"
					className={clsx(
						style.button,
						verticalAlign === "bottom" &&
							openedMenu === MENU_NAME &&
							style.menuBottom,
					)}
					onClick={handleClick}
					variant="secondary"
					rounded={rounded}
					active={openedMenu === MENU_NAME}
				>
					<span className={style.fontSize}>{fontSize}</span>
					<span
						ref={chevronRef}
						onClick={handleChevronClick}
						className={style.chevron}
					>
						<Icon width={20} height={20} iconName="Chevron" />
					</span>
				</UiButton>
			)}
		>
			{verticalAlign => (
				<UiPanel
					padding={0}
					vertical
					className={clsx(style.sizeList)}
					rounded={verticalAlign === "bottom" ? "bottom" : "full"}
				>
					<FontSizePicker
						id={"context-panel"}
						currentFontSize={fontSize}
						fontSizes={fontSizes}
						onPick={handlePick}
					/>
				</UiPanel>
			)}
		</ButtonWithMenu>
	);
}
