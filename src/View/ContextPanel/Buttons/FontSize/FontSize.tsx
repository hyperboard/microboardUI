import { ButtonWithMenu } from "View/ContextPanel/Buttons/ButtonWithMenu";
import { usePanelContext } from "View/ContextPanel/PanelContext";
import { Icon } from "View/Icon";
import { FontSizePicker } from "View/Pickers/FontSizePicker/FontSizePicker";
import { UiDivButton } from "View/Ui/UiButton/UiButton";
import { UiPanel } from "View/Ui/UiPanel/UiPanel";
import clsx from "clsx";
import React, { MouseEventHandler, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import style from "./FontSize.module.css";
import { useAppContext } from "View/AppContext";
import btnStyle from "../ContextPanelButton.module.css";

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

export function FontSize({ rounded = "none" }: Props): React.ReactElement {
	const { toggleMenu, openedMenu, panelMbr, windowHeight } =
		usePanelContext();
	const { t } = useTranslation();
	const { board } = useAppContext();
	const [fontSizeInputValue, setFontSizeInputValue] = useState<
		number | string
	>(
		board.selection.getAutosize()
			? t("contextPanel.fontSize.auto")
			: board.selection.getFontSize(),
	);
	const chevronRef = useRef<HTMLSpanElement>(null);
	const inputRef = useRef<HTMLInputElement | null>(null);

	const fontSize = board.selection.getFontSize();
	const selectionContext = board.selection.getContext();

	useEffect(() => {
		if (fontSize) {
			setFontSizeInputValue(fontSize);
		}
		if (board.selection.getAutosize()) {
			setFontSizeInputValue(t("contextPanel.fontSize.auto"));
		}
		if (
			selectionContext === "EditUnderPointer" &&
			openedMenu === MENU_NAME
		) {
			setTimeout(() => {
				inputRef.current?.focus();
			}, 80);
		}
	}, [fontSize, selectionContext, openedMenu]);

	const handleFocus = (ev: React.FocusEvent<HTMLInputElement>): void => {
		ev.currentTarget.select();
		if (openedMenu !== MENU_NAME) {
			toggleMenu(MENU_NAME);
		}
	};

	const handleInputClick = (ev: React.MouseEvent<HTMLInputElement>): void => {
		ev.stopPropagation();
		if (openedMenu !== MENU_NAME) {
			toggleMenu(MENU_NAME);
		}
		if (selectionContext === "EditTextUnderPointer") {
			board.selection.setContext("EditUnderPointer");
		}
	};

	const handlePick = (size: number | "auto"): void => {
		board.selection.setFontSize(size);
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
			board.selection.setFontSize(getNextBiggerValue(fontSize));
		} else {
			board.selection.setFontSize(getNextSmallerValue(fontSize));
		}
	};

	const handleInputChange = (
		ev: React.ChangeEvent<HTMLInputElement>,
	): void => {
		const fontSize = Number(ev.target.value);
		if (!!fontSize && fontSize >= 1) {
			board.selection.setFontSize(fontSize > 6 ? fontSize : 6);
		}
		setFontSizeInputValue(ev.target.value);
	};

	return (
		<ButtonWithMenu
			menuName={MENU_NAME}
			openedMenu={openedMenu}
			panelMbr={panelMbr}
			windowHeight={windowHeight}
			align="left"
			offset="Right"
			button={verticalAlign => (
				<UiDivButton
					id="pick-font-size"
					tooltip={t("contextPanel.fontSize.tooltip")}
					tooltipPosition="top"
					className={clsx(
						btnStyle.contextPanelButton,
						style.button,
						verticalAlign === "bottom" &&
							openedMenu === MENU_NAME &&
							style.menuBottom,
					)}
					variant="secondary"
					rounded={rounded}
					active={openedMenu === MENU_NAME}
				>
					<div className={style.fontSize}>
						<input
							ref={inputRef}
							id="pick-font-size-input"
							className={style.input}
							onClick={handleInputClick}
							onChange={handleInputChange}
							onFocus={handleFocus}
							onKeyDown={ev => ev.stopPropagation()}
							value={fontSizeInputValue}
							maxLength={3}
						/>
					</div>
					<span
						ref={chevronRef}
						onClick={handleChevronClick}
						className={style.chevron}
						id="FontSizeChevron"
					>
						<Icon width={20} height={20} iconName="Chevron" />
					</span>
				</UiDivButton>
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
