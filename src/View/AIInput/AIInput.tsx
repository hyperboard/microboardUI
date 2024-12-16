import React, { useEffect, useRef, useState } from "react";
import styles from "./AIInput.module.css";

import { useAppContext } from "View/AppContext";
import { useTranslation } from "react-i18next";
import { Icon } from "View/Icon";
import { StarIcon } from "./StarIcon";
import { useAppSubscription } from "Board/useBoardSubscription";

import { Mbr, RichText } from "Board/Items";
import { Board } from "Board";
import { useForceUpdate } from "lib/useForceUpdate";

interface AiChatMsg<T = AiChatEventType> {
	type: "AiChat";
	event: T;
}

type AiChatEventType = UserRequest;

interface UserRequest {
	method: "UserRequest";
	context: number[];
	boardContext: string[];
	idea: string;
	model?: OpenAIModels;
}

interface ChatChunk {
	method: "ChatChunk";
	chatId: number;
	type: "chunk" | "done" | "end" | "error";
	content?: string;
	error?: string;
}

type OpenAIModels =
	| "gpt-3.5-turbo"
	| "gpt-4"
	| "gpt-4o"
	| "gpt-4o-mini"
	| "gpt-4-32k"
	| "gpt-3.5-turbo-0613"
	| "gpt-4-0613"
	| "gpt-3.5-turbo-16k"
	| "gpt-4-16k"
	| "o1-mini";

export const AIInput: React.FC = () => {
	const { t } = useTranslation();
	const { board } = useAppContext();
	const [inputValue, setInputValue] = useState("");
	const inputRef = useRef<HTMLTextAreaElement | null>(null);
	const [model, setModel] = useState<OpenAIModels>("gpt-4o");
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const socketRef = useRef<WebSocket | null>(null);
	const forceUpdate = useForceUpdate();
	const selectedItemsCount = board.selection.items.list().length;

	useEffect(() => {
		focusInputOnSelectionChange();
	}, [board.selection.getContext()]);

	useEffect(() => {
		const connectWebSocket = () => {
			const socket = new WebSocket("ws://localhost:8000/ws");

			socket.onopen = () => {
				console.log("WebSocket connection established");
			};

			socket.onmessage = event => {
				try {
					const data = JSON.parse(event.data);
					console.log("Received message:", data);

					if (data.method === "ChatChunk") {
						handleChatChunk(data);
					}
				} catch (error) {
					console.error("Error parsing message:", error);
				}
			};

			socket.onerror = error => {
				console.error("WebSocket error:", error);
			};

			socket.onclose = () => {
				console.log(
					"WebSocket connection closed, attempting to reconnect...",
				);
				setTimeout(connectWebSocket, 5000);
			};

			socketRef.current = socket;
		};

		connectWebSocket();

		return () => {
			if (socketRef.current) {
				socketRef.current.close();
				console.log("WebSocket connection closed on cleanup");
			}
		};
	}, []);

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

		if (inputRef.current) {
			inputRef.current.style.height = "auto";
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

	const handleChatChunk = (chunk: ChatChunk) => {
		switch (chunk.type) {
			case "chunk":
				console.log("Received chunk:", chunk.content);
				break;
			case "done":
				console.log("Chat is done");
				break;
			case "end":
				console.log("Chat ended");
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
		richText.transformation.translateTo(
			board.pointer.point.x,
			board.pointer.point.y,
		);
		richText.transformation.scaleBy(1, 1);
		richText.editor.setMaxWidth(600);
		richText.editor.setSelectionHorisontalAlignment("left");
		richText.insideOf = richText.itemType;
		richText.editor.insertCopiedText(inputValue);
		richText.editor.editor.children = [
			{
				type: "paragraph",
				children: [
					{
						type: "text",
						text: inputValue,
						fontFamily: "Arial",
						fontSize: 14,
						fontColor: "black",
						fontHighlight: "Green",
						bold: false,
						underline: false,
						italic: false,
						overline: false,
						lineThrough: false,
						subscript: false,
						superscript: false,
					},
				],
				horisontalAlignment: "left",
			},
		];
		return richText;
	}

	const sendInputData = () => {
		if (
			!socketRef.current ||
			socketRef.current.readyState !== WebSocket.OPEN
		) {
			console.error("WebSocket is not open");
			return;
		}

		const message: AiChatMsg<UserRequest> = {
			type: "AiChat",
			event: {
				method: "UserRequest",
				context: [],
				boardContext: [],
				idea: inputValue,
				model: model,
			},
		};

		console.log("message", message);

		const richText = createRichText(board, inputValue);
		board.add(richText);

		socketRef.current.send(JSON.stringify(message));
		setInputValue("");
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
						<div onClick={() => selectModel("gpt-4o")}>
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
	);
};
