import React, { useEffect, useRef, useState } from "react";
import styles from "./AIInput.module.css";

import { useAppContext } from "View/AppContext";
import { useTranslation } from "react-i18next";
import { Icon } from "View/Icon";
import { StarIcon } from "./StarIcon";
import { useAppSubscription } from "Board/useBoardSubscription";

import { Connector, Mbr, RichText } from "Board/Items";
import { Board } from "Board";
import { useForceUpdate } from "lib/useForceUpdate";
import {
	AiChatMsg,
	ChatChunk,
	Connection,
	OpenAIModels,
	UserRequest,
} from "App/Connection";
import { getControlPointData } from "Board/Selection/QuickAddButtons";

export const AIInput: React.FC = () => {
	const { t } = useTranslation();
	const { app, board } = useAppContext();
	const [inputValue, setInputValue] = useState("");
	const inputRef = useRef<HTMLTextAreaElement | null>(null);
	const [model, setModel] = useState<OpenAIModels>("gpt-4o");
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const forceUpdate = useForceUpdate();
	const selectedItemsCount = board.selection.items.list().length;
	const [connection, setConnection] = useState<Connection | null>(null);

	useEffect(() => {
		focusInputOnSelectionChange();
	}, [board.selection.getContext()]);

	useEffect(() => {
		const appConnection = app.getConnection();
		if (appConnection) {
			appConnection.onMessage = msg => {
				try {
					if (msg.type === "AiChat") {
						const event = msg.event;
						if (event.method === "ChatChunk") {
							handleChatChunk(event);
						}
					}
				} catch (error) {
					console.error("Error parsing message:", error);
				}
			};

			appConnection.wsClient.send;
		}

		setConnection(appConnection);
	}, [app]);

	useAppSubscription({
		subjects: ["selectionItems"],
		observer: forceUpdate,
	});

	const focusInputOnSelectionChange = () => {
		if (board.selection.getContext() === "EditUnderPointer") {
			setTimeout(() => inputRef.current?.focus(), 80);
		}
	};

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

	const handleChatChunk = (chunk: ChatChunk): void => {
		const itemId = chunk.itemId;
		switch (chunk.type) {
			case "chunk":
				const item = board.items.getById(itemId);
				if (item && item.itemType === "RichText") {
					item.editor.insertAICopiedText(chunk.content || "");
				}
				break;
			case "done":
				console.log("Chat is done");
				break;
			case "end":
				console.log("User's request handled");
				break;
			case "error":
				console.error("Chat error:", chunk.error);
				break;
			default:
				console.warn("Unknown chunk type:", chunk.type);
		}
	};

	const toggleModelDropdown = () => {
		setIsDropdownOpen(!isDropdownOpen);
	};

	const selectModel = (model: OpenAIModels) => {
		setModel(model);
		setIsDropdownOpen(false);
	};

	function createRichText(board: Board, inputValue: string): RichText {
		const richText = new RichText(new Mbr());
		const cameraMbr = board.camera.getMbr();

		const centerX = cameraMbr.getCenter().x;
		const centerY = cameraMbr.getCenter().y;

		richText.transformation.translateTo(centerX, centerY);

		richText.transformation.scaleBy(1, 1);
		richText.editor.setMaxWidth(600);
		richText.editor.setSelectionHorisontalAlignment("left");
		richText.insideOf = richText.itemType;
		richText.editor.insertCopiedText(inputValue);
		return richText;
	}

	const sendInputData = () => {
		if (!connection) {
			console.error("Ws no open");
		}

		const requestRichText = createRichText(board, inputValue);
		const requestItem = board.add(requestRichText);
		const responseRichText = createRichText(board, "");
		const responseItem = board.add(responseRichText);
		const itemId = responseItem.getId();

		const defaultConnector = new Connector(board);
		const connectorData = defaultConnector.serialize();
		connectorData.lineStyle = "orthogonal";

		const startPointData = getControlPointData(requestItem, 2);
		const endPointData = getControlPointData(responseItem, 0);
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
				model: model,
				itemId: itemId,
			},
		};

		connection?.wsClient.send(message);

		setInputValue("");
	};

	return (
		<div className={styles.inputContainer}>
			<div className={styles.contentWrapper}>
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
		</div>
	);
};
