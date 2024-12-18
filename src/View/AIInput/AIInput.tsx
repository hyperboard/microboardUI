import React, { useEffect, useRef, useState } from "react";
import styles from "./AIInput.module.css";

import { useAppSubscription } from "Board/useBoardSubscription";
import { useTranslation } from "react-i18next";
import { useAppContext } from "View/AppContext";
import { Icon } from "View/Icon";
import { StarIcon } from "./StarIcon";

import { AiChatMsg, OpenAIModels, UserRequest } from "App/Connection";
import { Board } from "Board";
import { Connector, Mbr, RichText } from "Board/Items";
import { useForceUpdate } from "lib/useForceUpdate";

import { ControlPointData } from "Board/Items/Connector/ControlPoint";
import { Chevron } from "shared/ui-lib/Dropdown/Chevron";
import { TEXT_HIGHLIGHT_COLORS } from "View/Tools/AddText";
import { UiPanel } from "View/Ui/UiPanel";

export const AIInput: React.FC = () => {
	const { t } = useTranslation();
	const { app, board } = useAppContext();
	const [inputValue, setInputValue] = useState("");
	const inputRef = useRef<HTMLTextAreaElement | null>(null);
	const [model, setModel] = useState<OpenAIModels>("gpt-4o");
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const forceUpdate = useForceUpdate();
	const selectedItemsCount = board.selection.items.list().length;

	const isPhoneScreenCheck = () =>
		matchMedia("screen and (max-width: 640px)").matches;
	const [isPhoneScreen, setIsPhoneScreen] = useState(isPhoneScreenCheck);
	useEffect(() => {
		const setScreen = () => {
			setIsPhoneScreen(isPhoneScreenCheck());
		};

		window.addEventListener("resize", setScreen);

		return () => {
			window.removeEventListener("resize", setScreen);
		};
	});

	useAppSubscription({
		subjects: ["selectionItems"],
		observer: forceUpdate,
	});

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
		sendInputData();
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

	const selectModel = (model: OpenAIModels) => {
		setModel(model);
		setIsDropdownOpen(false);
	};

	function createRichText(
		board: Board,
		inputValue: string,
		offsetY = 0,
		needFontColor = true,
	): RichText {
		const richText = new RichText(new Mbr());
		const cameraMbr = board.camera.getMbr();

		const centerX = cameraMbr.getCenter().x;
		const centerY = cameraMbr.getCenter().y + offsetY;

		richText.transformation.translateTo(centerX, centerY);

		richText.transformation.scaleBy(1, 1);
		richText.editor.setMaxWidth(600);
		richText.editor.setSelectionHorisontalAlignment("left");
		richText.insideOf = richText.itemType;
		const highlightColor = TEXT_HIGHLIGHT_COLORS[11];
		if (needFontColor) {
			richText.editor.applySelectionFontColor(highlightColor);
		}
		richText.editor.insertCopiedText(inputValue);
		return richText;
	}
	const sendInputData = () => {
		const connection = app.getConnection();
		if (!connection) {
			console.error("Ws no open");
		}

		const requestRichText = createRichText(board, inputValue);
		const requestAdded = board.add(requestRichText);
		const responseRichText = createRichText(board, "", 100, false);
		const responseAdded = board.add(responseRichText);
		responseAdded.editor.setMaxWidth(600);

		const defaultConnector = new Connector(board);
		const connectorData = defaultConnector.serialize();
		connectorData.lineStyle = "orthogonal";

		const startPointData: ControlPointData = {
			pointType: "Fixed",
			itemId: requestAdded.getId(),
			relativeY:
				requestRichText.getTransformedContainer().getHeight() * 5, // ffs - for some reason relative point of rt must be 5 times more, than its actual height (e.g. instaed of 19.6 it must be 100)
			relativeX: requestRichText.getTransformedContainer().getWidth() / 3, // ffs
		};
		const endPointData: ControlPointData = {
			pointType: "Fixed",
			itemId: responseAdded.getId(),
			relativeY: 0,
			relativeX:
				responseRichText.getTransformedContainer().getWidth() / 3, // ffs
		};
		connectorData.startPoint = startPointData;
		connectorData.endPoint = endPointData;

		board.add(board.createItem(board.getNewItemId(), connectorData));

		const message: AiChatMsg<UserRequest> = {
			type: "AiChat",
			boardId: board.getBoardId(),
			event: {
				method: "UserRequest",
				context: [],
				boardContext: [],
				idea: inputValue,
				model,
				itemId: responseAdded.getId(),
			},
		};

		connection.wsClient.send(message);

		setInputValue("");

		if (inputRef.current) {
			inputRef.current.style.height = "auto";
		}
	};

	return (
		<UiPanel padding={0} className={styles.inputContainer}>
			<div className={styles.contentWrapper}>
				<div className={styles.modelSelector}>
					<div
						className={styles.selectedModel}
						onClick={toggleModelDropdown}
					>
						{model !== "gpt-4o" && <span>{model}</span>}
						{model === "gpt-4o" && (
							<span>{isPhoneScreen ? "4o" : model}</span>
						)}
						<StarIcon className={styles.starIcon} />
						<Chevron />
					</div>
					{isDropdownOpen && (
						<div className={styles.modelDropdown}>
							<div onClick={() => selectModel("gpt-4o")}>
								<strong>GPT-4o</strong>
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
					placeholder={"Select context, ask AI"}
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
		</UiPanel>
	);
};
