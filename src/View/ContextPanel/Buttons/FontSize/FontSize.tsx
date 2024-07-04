import { ButtonWithMenu } from "View/ContextPanel/Buttons/ButtonWithMenu";
import { usePanelContext } from "View/ContextPanel/PanelContext";
import { Icon } from "View/Icon";
import { FontSizePicker } from "View/Pickers/FontSizePicker/FontSizePicker";
import { UiButton } from "View/Ui/UiButton/UiButton";
import { UiPanel } from "View/Ui/UiPanel/UiPanel";
import clsx from "clsx";
import React, { MouseEventHandler, useRef } from "react";
import { useTranslation } from "react-i18next";
import style from "./FontSize.module.css";
import { useAppContext } from "View/AppContext";

const MENU_NAME = "FontSize";

const fontSizes = [10, 12, 14, 18, 24, 36, 48, 64, 80, 144, 288];

const getNextBiggerValue = (value: number): number =>
	fontSizes.find(size => size > value) ?? fontSizes[fontSizes.length - 1];

const getNextSmallerValue = (value: number): number =>
	fontSizes
		.slice()
		.reverse()
		.find(size => size < value) ?? fontSizes[0];

type Props = {
	rounded?: "none" | "left";
};

export function FontSize({ rounded = "none" }: Props): React.ReactNode {
	const { toggleMenu, openedMenu, panelMbr, windowHeight } =
		usePanelContext();
	const { board } = useAppContext();
	const { t } = useTranslation();
	const chevronRef = useRef<HTMLSpanElement>(null);

	const fontSize = board.selection.getFontSize();

	const handleClick = (): void => {
		toggleMenu(MENU_NAME);
	};

	const handlePick = (size: number | "auto"): void => {
		if (size === "auto") {
			board.selection.autosizeEnable();
		} else {
			board.selection.autosizeDisable();
			board.selection.setFontSize(size);
		}
		toggleMenu("None");
	};

	const handleChevronClick: MouseEventHandler = event => {
		event.stopPropagation();

		if (!chevronRef.current) {
			return;
		}

		const rect = chevronRef.current.getBoundingClientRect();
		const midpoint = rect.top + rect.height / 2;

		if (event.clientY < midpoint) {
			board.selection.autosizeDisable();
			board.selection.setFontSize(getNextBiggerValue(fontSize));
		} else {
			board.selection.autosizeDisable();
			board.selection.setFontSize(getNextSmallerValue(fontSize));
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
					<span className={style.fontSize}>
						{board.selection.getAutosize()
							? t("contextPanel.fontSize.auto")
							: fontSize}
					</span>
					<span
						ref={chevronRef}
						onClick={handleChevronClick}
						className={style.chevron}
						id="FontSizeChevron"
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
						id={"FontSize"}
						currentFontSize={
							board.selection.getAutosize() ? "auto" : fontSize
						}
						fontSizes={fontSizes}
						showAuto={
							board.selection.list().length ===
							board.selection.items.getItemsByItemTypes([
								"Sticker",
							]).length
						}
						onPick={handlePick}
					/>
				</UiPanel>
			)}
		</ButtonWithMenu>
	);
}
