import React, {
	useEffect,
	useRef,
	useState,
	type MouseEventHandler,
	type SyntheticEvent,
} from "react";
import styles from "./AIInput.module.css";

import { useAppSubscription } from "Board/useBoardSubscription";
import { useTranslation } from "react-i18next";
import { useAppContext } from "View/AppContext";
import { Icon } from "View/Icon";
import { StarIcon } from "./StarIcon";

import { AiChatMsg, OpenAIModels, UserRequest } from "App/Connection";
import { Board } from "Board";
import { Connector } from "Board/Items";
import { useForceUpdate } from "lib/useForceUpdate";

import { ControlPointData } from "Board/Items/Connector/ControlPoint";
import { Chevron } from "shared/ui-lib/Dropdown/Chevron";
import { UiPanel } from "View/Ui/UiPanel";
import { AINode } from "Board/Items/AINode/AINode";
import { useAccount } from "App/useAccount";
import { useUiModalContext } from "View/Ui/UiModal";
import { AI_UNAVAILABLE_MODAL_ID } from "View/AiUnavailableModal/AiUnavailableModal";
import clsx from "clsx";
import { useNavigate } from "react-router-dom";
import { useMediaQuery } from "lib/useMediaQuery";
import { USER_PLAN_MODAL_ID } from "View/UserPlan";

export const AIInput: React.FC = () => {
	const { t } = useTranslation();
	const { app, board } = useAppContext();
	const [inputValue, setInputValue] = useState("");
	const inputRef = useRef<HTMLTextAreaElement | null>(null);
	const [model, setModel] = useState<OpenAIModels>("gpt-4o");
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement | null>(null);
	const forceUpdate = useForceUpdate();
	const selectedItemsCount = board.selection.items.list().length;
	const account = useAccount();
	const { openModal } = useUiModalContext();
	const [isShaking, setIsShaking] = useState(false);
	const navigate = useNavigate();
	const isMediaMatches = useMediaQuery("(max-width: 1170px)");

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

	const handleSendClick = async (ev: SyntheticEvent) => {
		ev.stopPropagation();
		if (!inputValue.trim()) {
			return;
		}
		if (!account.isLoggedIn) {
			return openModal(AI_UNAVAILABLE_MODAL_ID);
		}
		if ((account.billingInfo?.remainingTokens ?? 0) <= 0) {
			setIsShaking(true);
			setTimeout(() => {
				setIsShaking(false);

				if (isMediaMatches) {
					navigate("/user/plan");
				} else {
					openModal(USER_PLAN_MODAL_ID);
				}
			}, 1000);
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
		if (event.key === "Enter" && !event.shiftKey) {
			event.preventDefault();
			handleSendClick(event);
		}
	};

	const toggleModelDropdown = () => {
		setIsDropdownOpen(!isDropdownOpen);
	};

	const selectModel = (model: OpenAIModels) => {
		setModel(model);
		setIsDropdownOpen(false);
	};

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsDropdownOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [dropdownRef]);

	function createNode(
		board: Board,
		inputValue: string,
		isUserRequest: boolean,
		parentNodeId?: string,
		offsetY = 0,
	): AINode {
		const node = new AINode(isUserRequest, parentNodeId);
		const cameraMbr = board.camera.getMbr();

		const centerX = cameraMbr.getCenter().x;
		const centerY = cameraMbr.getCenter().y + offsetY;

		node.transformation.translateTo(centerX, centerY);

		node.getRichText().setMaxWidth(600);
		node.getRichText().setSelectionHorisontalAlignment("left");

		node.getRichText().editor.insertCopiedText(inputValue);
		return node;
	}

	const sendInputData = () => {
		const connection = app.getConnection();
		if (!connection) {
			console.error("Ws no open");
		}

		const selectedNode = board.selection.items.getItemsByItemTypes([
			"AINode",
		])[0];
		const offsetY = selectedNode?.getMbr().bottom;
		const selectedNodeId = selectedNode?.getId();

		const requestNode = createNode(
			board,
			inputValue,
			true,
			selectedNodeId,
			offsetY
				? offsetY - board.camera.getMbr().getCenter().y + 100
				: undefined,
		);
		const requestAdded = board.add(requestNode);
		const responseNode = createNode(
			board,
			"",
			false,
			requestNode.getId(),
			requestNode.getMbr().bottom -
				board.camera.getMbr().getCenter().y +
				100,
		);
		const responseAdded = board.add(responseNode);

		const defaultConnector = new Connector(board);
		const connectorData = defaultConnector.serialize();
		connectorData.lineStyle = "curved";

		const selectedItems = board.selection.items.list();
		const boardContext = selectedItems
			.map(item => {
				const richText = item.getRichText();
				if (richText) {
					const textNodes = richText.editor.getText();
					if (Array.isArray(textNodes)) {
						return textNodes
							.map(paragraph => {
								if ("children" in paragraph) {
									return paragraph.children
										.map(child => child.text || "")
										.join(" ");
								}
								return "";
							})
							.join(" ")
							.trim();
					}
				}
				return "";
			})
			.filter(text => text !== "");

		const startPointData: ControlPointData = {
			pointType: "Fixed",
			itemId: requestAdded.getId(),
			relativeY: requestNode.getMbr().getHeight() * 5, // ffs - for some reason relative point of rt must be 5 times more, than its actual height (e.g. instaed of 19.6 it must be 100)
			relativeX: requestNode.getMbr().getWidth() / 3, // ffs
		};
		const endPointData: ControlPointData = {
			pointType: "Fixed",
			itemId: responseAdded.getId(),
			relativeY: 0,
			relativeX: responseNode.getMbr().getWidth() / 3, // ffs
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
				boardContext,
				idea: inputValue,
				model,
				itemId: responseAdded.getId(),
				contextRequest: {
					range: 5,
					itemId: selectedNodeId,
				},
			},
		};

		connection.wsClient.send(message);

		setInputValue("");

		if (inputRef.current) {
			inputRef.current.style.height = "auto";
		}
	};

	return (
		<UiPanel
			padding={0}
			className={clsx(styles.inputContainer, isShaking && styles.shake)}
			ref={dropdownRef}
		>
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
						<Chevron />
					</div>
					<StarIcon className={styles.starIcon} />
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
						width={20}
						height={20}
						iconName="Vector"
						className={styles.icon}
					/>
				</button>
			</div>
		</UiPanel>
	);
};
