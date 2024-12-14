import React, { useEffect, useRef, useState } from "react";
import styles from "./AIInput.module.css";
import { api } from "shared/api";
import { useAppContext } from "View/AppContext";
import { useTranslation } from "react-i18next";
import { Icon } from "View/Icon";
import { StarIcon } from "./StarIcon";
import { useAppSubscription } from "Board/useBoardSubscription";
import { requestMap } from "shared/api/ai";

export const AIInput: React.FC = () => {
	const { t } = useTranslation();
	const { board } = useAppContext();
	const [inputValue, setInputValue] = useState("");
	const inputRef = useRef<HTMLTextAreaElement | null>(null);
	const [model, setModel] = useState("GPT-4.0");
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [selectedItemsCount, setSelectedItemsCount] = useState(0);
	console.log("selectedItemsCount", selectedItemsCount);

	useEffect(() => {
		focusInputOnSelectionChange();
	}, [board.selection.getContext()]);

	useAppSubscription({
		subjects: ["selectionItems"],
		observer: () => {
			setSelectedItemsCount(board.selection.items.list().length);
		},
	});

	const focusInputOnSelectionChange = () => {
		if (board.selection.getContext() === "EditUnderPointer") {
			setTimeout(() => inputRef.current?.focus(), 80);
		}
	};
	// async function createChat(boardId: number) {
	// 	const response = await api.post(requestMap.createChat.url, { boardId });
	// 	return response.data;
	//   }
	const handleInputChange = (
		event: React.ChangeEvent<HTMLTextAreaElement>,
	) => {
		setInputValue(event.target.value);
		event.target.style.height = "auto";
		event.target.style.height = `${Math.min(event.target.scrollHeight, 120)}px`;
	};

	const handleSendClick = async () => {
		if (!inputValue.trim()) {
			return;
		}
		await sendInputData();
	};

	const sendInputData = async () => {
		try {
			const response = await api.post("/endpoint", { data: inputValue });
			console.log("Response from server:", response.data);
			setInputValue("");
		} catch (error) {
			console.error("Error sending data:", error);
			setInputValue("");
		}
	};

	const handleInputClick = (event: React.MouseEvent<HTMLTextAreaElement>) => {
		event.stopPropagation();
		if (board.selection.getContext() === "EditTextUnderPointer") {
			board.selection.setContext("EditUnderPointer");
		}
	};

	const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
		event.stopPropagation();
		if (event.key === "Enter") {
			event.preventDefault();
			handleSendClick();
		}
	};

	const toggleModelDropdown = () => {
		setIsDropdownOpen(!isDropdownOpen);
	};

	const selectModel = (model: string) => {
		setModel(model);
		setIsDropdownOpen(false);
	};

	return (
		<div className={styles.inputContainer}>
			<div className={styles.modelSelector}>
				<div
					className={styles.selectedModel}
					onClick={toggleModelDropdown}
				>
					<span>{model}</span>
					<StarIcon />
				</div>
				{isDropdownOpen && (
					<div className={styles.modelDropdown}>
						<div onClick={() => selectModel("GPT-4.0")}>
							<strong>GPT-4.0</strong>
							<p>Отлично подходит для большинства задач</p>
						</div>
						<div onClick={() => selectModel("o1")}>
							<strong>o1</strong>
							<p>Использует продвинутые рассуждения</p>
						</div>
						<div onClick={() => selectModel("o1-mini")}>
							<strong>o1-mini</strong>
							<p>Быстрее рассуждает</p>
						</div>
					</div>
				)}
			</div>
			<textarea
				value={inputValue}
				onClick={event => handleInputClick(event)}
				onPaste={event => event.stopPropagation()}
				onKeyDown={event => handleKeyDown(event)}
				onFocus={event => event.currentTarget.select()}
				onChange={event => handleInputChange(event)}
				placeholder={t("Type your request...")}
				className={styles.aiInput}
				ref={inputRef}
				rows={1}
			/>
			<div className={styles.selectionInfo}>
				{"Selected:"} {selectedItemsCount} {"items"}
			</div>
			<button onClick={handleSendClick} className={styles.sendButton}>
				<Icon
					width={17}
					height={17}
					iconName="Vector"
					className={styles.icon}
				/>
			</button>
		</div>
	);
};
