import React, { useEffect, useState } from "react";
import { Input } from "shared/ui-lib/Input/Input";
import styles from "./HyperLinkInput.module.css";
import { useHyperLinkContext } from "View/hyperLink/HyperLinkContext";
import { useAppContext } from "View/AppContext";
import { useClickOutside } from "lib/useClickOutside";

export const HyperLinkInput = () => {
	const [inputValue, setInputValue] = useState<string>("");
	const { isEditingLink, setIsEditingLink, hyperLinkData } =
		useHyperLinkContext();
	const { board } = useAppContext();
	const containerRef = useClickOutside(
		() => {
			if (isEditingLink) {
				setIsEditingLink(false);
			}
		},
		[],
		true,
	);

	const richTextEditor = board.selection.items
		.getSingle()
		?.getRichText()?.editor;

	useEffect(() => {
		if (hyperLinkData) {
			const link = richTextEditor?.getFirstSelectionLink(
				hyperLinkData.selection,
			);
			if (link !== inputValue) {
				setInputValue(link || "");
			}
		}
	}, [hyperLinkData]);

	useEffect(() => {
		if (isEditingLink && hyperLinkData) {
			if (board.selection.getContext() === "EditTextUnderPointer") {
				board.selection.setContext("EditUnderPointer");
			}
		}
	}, [isEditingLink]);

	if (!isEditingLink || !hyperLinkData) {
		return null;
	}

	const handleBtnClick = () => {
		board.selection.setHyperLink(inputValue, hyperLinkData.selection);
		setInputValue("");
		setIsEditingLink(false);
	};

	const handleInputClick = (
		event: React.MouseEvent<HTMLInputElement>,
	): void => {
		event.stopPropagation();
		if (board.selection.getContext() === "EditTextUnderPointer") {
			board.selection.setContext("EditUnderPointer");
		}
	};

	return (
		<div
			ref={containerRef}
			className={styles.inputContainer}
			style={{
				top: hyperLinkData.inputPosition.top,
				left: hyperLinkData.inputPosition.left,
			}}
		>
			<Input
				shouldSelect={true}
				id="hyper-link-input"
				placeholder="Вставьте ссылку"
				value={inputValue}
				onClick={handleInputClick}
				onFocus={event => event.currentTarget.select()}
				onPaste={event => event.stopPropagation()}
				onChange={e => setInputValue(e.target.value)}
			/>
			<button onClick={handleBtnClick} className={styles.btn}>
				Принять
			</button>
		</div>
	);
};
