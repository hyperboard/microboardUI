import React, { useEffect, useState } from "react";
import { Input } from "shared/ui-lib/Input/Input";
import styles from "./HyperLinkInput.module.css";
import { useHyperLinkContext } from "View/hyperLink/HyperLinkContext";
import { useAppContext } from "View/AppContext";
import { useClickOutside } from "lib/useClickOutside";
import { Icon } from "View/Icon/Icon";
import { useDomMbr } from "Board/Items/Mbr/useDomMbr";

export const HyperLinkInput = () => {
	const [inputValue, setInputValue] = useState<string>("");
	const { isEditingLink, setIsEditingLink, hyperLinkData, setHyperLinkData } =
		useHyperLinkContext();
	const { board, app } = useAppContext();
	const containerRef = useClickOutside(
		() => {
			if (isEditingLink) {
				setIsEditingLink(false);
			}
		},
		[],
		true,
	);

	const mbr = useDomMbr({
		app,
		board,
		ref: containerRef,
		targetMbr: board.selection.items.getSingle()?.getRichText()?.getMbr(),
		subjects: ["pointer"],
		fit: "hyperLink",
	});

	const richTextEditor = board.selection.items
		.getSingle()
		?.getRichText()?.editor;

	useEffect(() => {
		if (hyperLinkData && hyperLinkData.isWatchMode) {
			const link = richTextEditor?.getFirstSelectionLink(
				hyperLinkData.selection,
			);
			if (link !== inputValue) {
				setInputValue(link || "");
			}
		}
		if (!hyperLinkData) {
			setInputValue("");
		}
	}, [hyperLinkData]);

	if (!hyperLinkData || (!isEditingLink && !hyperLinkData.isWatchMode)) {
		return null;
	}

	const handleConfirmBtnClick = () => {
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

	const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
		if (event.key === "Enter") {
			handleConfirmBtnClick();
		}
		event.stopPropagation();
	};

	const handleEditBtnClick = () => {
		setHyperLinkData({ ...hyperLinkData, isWatchMode: false });
		setIsEditingLink(true);
	};

	const handleDeleteBtnClick = () => {
		board.selection.setHyperLink(undefined, hyperLinkData.selection);
	};
	const left = hyperLinkData.inputPosition?.left || mbr.left;
	const top = hyperLinkData.inputPosition?.top || mbr.top;

	return (
		<div
			ref={containerRef}
			className={styles.container}
			style={{
				top,
				left,
			}}
		>
			{hyperLinkData.isWatchMode ? (
				<>
					<a
						className={styles.link}
						target="_blank"
						href={inputValue}
						rel="noreferrer"
					>
						{inputValue}
					</a>
					<button
						className={styles.iconButton}
						onClick={handleEditBtnClick}
					>
						<Icon iconName={"EditPen"} width={16} height={16} />
					</button>
					<button
						className={styles.iconButton}
						onClick={handleDeleteBtnClick}
					>
						<Icon iconName={"Delete"} width={18} height={18} />
					</button>
				</>
			) : (
				<div className={styles.inputContainer}>
					<Input
						onKeyDown={onKeyDown}
						shouldSelect={true}
						id="hyper-link-input"
						placeholder="Вставьте ссылку"
						value={inputValue}
						onClick={handleInputClick}
						onFocus={event => event.currentTarget.select()}
						onPaste={event => event.stopPropagation()}
						onChange={e => setInputValue(e.target.value)}
					/>
					<button
						onClick={handleConfirmBtnClick}
						className={styles.confirmBtn}
					>
						Принять
					</button>
				</div>
			)}
		</div>
	);
};
