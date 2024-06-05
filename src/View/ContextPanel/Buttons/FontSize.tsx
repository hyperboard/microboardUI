import React, { useEffect } from "react";
import { Sticker } from "Board/Items/Sticker";
import { FontSizePicker } from "View/Pickers/FontSizePicker";
import { Board } from "Board";
import { Item, Frame, Mbr, Shape } from "Board/Items";
import { toFiniteNumber } from "utils";
import { toggleEdit } from "Board/Items/RichText/RichText";
import { ButtonWithMenu } from "./ButtonWithMenu";
import { Icon } from "View/Icon";
import { useTranslation } from "react-i18next";

type FontSizeProps = {
	board: Board;
	toggleMenu: (menu: string) => void;
	setShouldUpd: React.Dispatch<React.SetStateAction<boolean>>;
	menu: string;
	panelMbr: Mbr;
	windowHeight: number;
	fontSize: number | string;
	max?: number;
};

export function FontSize({
	board,
	fontSize: fontSizeInit,
	setShouldUpd,
	menu,
	panelMbr,
	toggleMenu,
	windowHeight,
	max: maxInit,
}: FontSizeProps) {
	const menuRef = React.useRef<HTMLDivElement>();
	const [fontSize, setFontSize] = React.useState(fontSizeInit);
	const [max, setMax] = React.useState(maxInit);
	const [inputType, setInputType] = React.useState<"number" | "Auto">(
		"number",
	);
	const [currItem, setCurrItem] = React.useState<undefined | Item>();
	const { t } = useTranslation();

	const updateAutosizeSettings = (): void => {
		const single = board.selection.items.getSingle();
		setCurrItem(single);
		if (single instanceof Sticker) {
			const isAutosize = single.text.getAutosize();
			const innerTextFontSize = single.text.getFontSize();
			const maxFontSize = single.text.getMaxFontSize();
			setMax(maxFontSize);
			setFontSize(isAutosize ? "Auto" : innerTextFontSize);
			setInputType(isAutosize ? "Auto" : "number");
		}
		if (single instanceof Shape) {
			const maxFontSize = single.text.getMaxFontSize();
			setFontSize(single?.text?.getFontSize());
			setInputType("number");
			setMax(maxFontSize);
		}
	};

	useEffect(() => {
		updateAutosizeSettings();
	}, [inputType, fontSize]);

	if (board.selection.getContext() === "SelectUnderPointer") {
		return null;
	}

	if (
		(board.selection.getContext() !== "EditTextUnderPointer" &&
			!board.selection.canChangeText()) ||
		board.selection.items.getSingle() instanceof Frame
	) {
		return null;
	}

	const handleClick = (): void => {
		toggleMenu("FontSize");
	};

	const handleInput: React.FormEventHandler<HTMLInputElement> = event => {
		event.preventDefault();
		return;
	};

	const handleChange: React.ChangeEventHandler<HTMLInputElement> = (
		event: React.ChangeEvent<HTMLInputElement>,
	): void => {
		if (currItem instanceof Sticker) {
			currItem.text.autosizeDisable();
			setInputType("number");
		}
		const size = toFiniteNumber(parseInt(event.target.value));
		setFontSize(size > 288 ? 288 : size);
		if (size < 10) {
			return;
		}
		board.selection.setFontSize(size > 288 ? 288 : size);
	};

	const handleFocus = (): void => {
		toggleEdit(true);
	};

	const handleBlur = (): void => {
		toggleEdit(false);
	};

	const handlePick = (size: number) => {
		board.selection.setFontSize(size);
		setFontSize(size);
		toggleMenu("None");
	};

	const handleStickerShevrone = (type: "inc" | "dec"): void => {
		if (currItem instanceof Sticker) {
			const currSize = Math.floor(currItem.text.getFontSize());
			currItem.text.autosizeDisable();
			setInputType("number");
			setFontSize(type === "inc" ? currSize + 1 : currSize - 1);
			board.selection.setFontSize(
				type === "inc" ? currSize + 1 : currSize - 1,
			);
		}
	};

	const onIncrease = (): void => {
		setShouldUpd(false);
		if (!parseInt(`${fontSize}`)) {
			handleStickerShevrone("inc");
			return;
		}
		if (parseInt(`${fontSize}`) >= 288) {
			return;
		}
		setFontSize(prev => +prev + 1);
		board.selection.setFontSize(+fontSize + 1);
	};

	const onDecrease = (): void => {
		setShouldUpd(false);
		if (!parseInt(`${fontSize}`)) {
			handleStickerShevrone("dec");
			return;
		}
		if (parseInt(`${fontSize}`) <= 1) {
			return;
		}
		setFontSize(prev => +prev - 1);
		board.selection.setFontSize(+fontSize - 1);
	};

	return (
		<ButtonWithMenu
			panelMbr={panelMbr}
			windowHeight={windowHeight}
			menuRef={menuRef}
		>
			<div style={{ display: "flex", alignItems: "center" }}>
				<input
					id={"FontSizeInput"}
					onClick={handleClick}
					type={inputType}
					min="10"
					max={max}
					value={`${
						inputType === "Auto"
							? t("contextPanel.fontSize.auto")
							: fontSize
					}`}
					onInput={handleInput}
					onChange={handleChange}
					onFocus={handleFocus}
					onBlur={handleBlur}
					style={{
						height: "45px",
						display: "flex",
						textAlign: "center",
						maxWidth: "50px",
						fontSize: "14px",
						justifyContent: "center",
						alignItems: "center",
						padding: "0px",
						backgroundColor: "white",
						border: "none",
						WebkitAppearance: "none",
						MozAppearance: "none",
					}}
				/>
				<div style={{ display: "flex", flexDirection: "column" }}>
					<div
						id={"FontSizeChevronUp"}
						style={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							justifyContent: "center",
						}}
						onClick={onIncrease}
					>
						<Icon width={16} height={16} name="ChevronUp" />
					</div>
					<div
						id={"FontSizeChevronDown"}
						style={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							justifyContent: "center",
						}}
						onClick={onDecrease}
					>
						<Icon width={16} height={16} name="ChevronDown" />
					</div>
				</div>
			</div>
			<div
				id="FontSizeMenu"
				ref={menuRef}
				className="ContextPanelMenu"
				style={{
					width: "40px",
					marginLeft: "-25px",
					visibility: menu === "FontSize" ? "visible" : "hidden",
				}}
			>
				<FontSizePicker
					maxSize={max}
					inputType={inputType}
					onPick={(size: number | "Auto") => {
						const single = board.selection.items.getSingle();
						if (
							single &&
							single.itemType === "Sticker" &&
							size !== "Auto"
						) {
							single.text?.autosizeDisable();
						}
						if (
							size === "Auto" &&
							single &&
							single.itemType === "Sticker"
						) {
							single?.text?.autosizeEnable();
							const maxFontSize = (
								single as Sticker
							).text.getMaxFontSize();
							board.selection.setFontSize(maxFontSize);
						} else if (size !== "Auto") {
							board.selection.setFontSize(size);
						}
						setFontSize(size);
						toggleMenu("None");
					}}
				/>
			</div>
		</ButtonWithMenu>
	);
}
