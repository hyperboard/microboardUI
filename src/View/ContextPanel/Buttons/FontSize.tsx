import React, { useEffect, useState } from "react";
import { Sticker } from "Board/Items/Sticker";
import { FontSizePicker } from "View/Pickers/FontSizePicker";
import { Board } from "Board";
import { Mbr } from "Board/Items";
import { toFiniteNumber } from "utils";
import { toggleEdit } from "Board/Items/RichText/RichText";
import { ButtonWithMenu } from "./ButtonWithMenu";
import { Icon } from "View/Icon";
import { useTranslation } from "react-i18next";

type FontSizeProps = {
	board: Board;
	toggleMenu: (menu: string) => void;
	menu: string;
	panelMbr: Mbr;
	windowHeight: number;
	fontSize: number | string;
	max?: number;
};

export function FontSize({
	board,
	fontSize: fontSizeInit,
	menu,
	panelMbr,
	toggleMenu,
	windowHeight,
	max: maxInit,
}: FontSizeProps) {
	const menuRef = React.useRef<HTMLDivElement>();
	const [fontSize, setFontSize] = useState(fontSizeInit);
	const [max, setMax] = useState(maxInit);
	const [itemType, setItemType] = useState("");
	const [inputType, setInputType] = useState("number");
	const { t } = useTranslation();

	const updateFontSize = () => {
		setFontSize(board.selection.getFontSize());
	};

	const updateAutosizeSettings = (): void => {
		const singleItem = board.selection.items.getSingle();
		if (singleItem && singleItem.itemType === "Sticker") {
			const isAutosize = (singleItem as Sticker).text.getAutosize();
			const innerTextFontSize = (
				singleItem as Sticker
			).text.getFontSize();
			const maxFontSize = (singleItem as Sticker).text.getMaxFontSize();
			setMax(maxFontSize);
			setFontSize(isAutosize ? "Auto" : innerTextFontSize);
			setItemType("Sticker");
			setInputType(isAutosize ? "string" : "number");
		}
		if (singleItem && ["Shape"].indexOf(singleItem?.itemType) !== -1) {
			const maxFontSize = (singleItem as Sticker).text.getMaxFontSize();
			setItemType(singleItem?.itemType);
			setFontSize(singleItem?.text?.getFontSize());
			setInputType("number");
			setMax(maxFontSize);
		}
	};

	useEffect(() => {
		updateAutosizeSettings();
	});

	if (board.selection.getContext() === "SelectUnderPointer") {
		return null;
	}

	if (
		board.selection.getContext() !== "EditTextUnderPointer" &&
		!board.selection.canChangeText()
	) {
		return null;
	}

	const handleClick = () => {
		toggleMenu("FontSize");
	};

	const handleInput: React.FormEventHandler<HTMLInputElement> = event => {
		event.preventDefault();
		return;
	};

	const handleChange: React.ChangeEventHandler<HTMLInputElement> = (
		event: React.ChangeEvent<HTMLInputElement>,
	): void => {
		const size = toFiniteNumber(parseInt(event.target.value));
		setFontSize(size);
		if (size < 10 || size > 288) {
			return;
		}
		board.selection.setFontSize(size);
		setFontSize(size);
	};

	const handleFocus = () => {
		toggleEdit(true);
	};

	const handleBlur = () => {
		toggleEdit(false);
	};

	const handlePick = (size: number) => {
		board.selection.setFontSize(size);
		setFontSize(size);
		toggleMenu("None");
	};

	const onIncrease = (): void => {
		if (!parseInt(`${fontSize}`)) {
			return;
		}

		setFontSize(prev => +prev + 1);

		board.selection.setFontSize(+fontSize + 1);
	};

	const onDecrease = (): void => {
		if (!parseInt(`${fontSize}`)) {
			return;
		}
		board.selection.setFontSize(+fontSize - 1);

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
					onClick={handleClick}
					type={inputType}
					min="10"
					max={max}
					value={`${
						fontSize === "Auto"
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
				id="FillStyleMenu"
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
					itemType={itemType || ""}
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
