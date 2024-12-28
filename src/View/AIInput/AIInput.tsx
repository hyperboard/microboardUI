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
import {
	Connector,
	ConnectorData,
	Item,
	ItemData,
	Matrix,
	Mbr,
	Point,
	RichText,
} from "Board/Items";
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
import { SessionStorage } from "App/SessionStorage";
import { getControlPointData } from "Board/Selection/QuickAddButtons/quickAddHelpers";

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

	function getEndPointPosition(mbr: Mbr): Point | undefined {
		if (!mbr) {
			return;
		}

		const center = mbr.getCenter();
		const height = mbr.getHeight();
		const position = new Point(center.x, center.y - height / 2);
		return position;
	}

	const createConnector = (startNode: AINode, endNode: AINode) => {
		const defaultConnector = new Connector(board);
		const connectorData = defaultConnector.serialize();
		connectorData.lineStyle = "orthogonal";
		const startAnchor = startNode.getSnapAnchorPoints()[1];
		const startMatrix = startNode.transformation.matrix.getInverse();
		startAnchor.transform(startMatrix);

		const endAnchor = endNode.getSnapAnchorPoints()[0];
		const endMatrix = endNode.transformation.matrix.getInverse();
		endAnchor.transform(endMatrix);

		const startPointData: ControlPointData = {
			pointType: "Fixed",
			itemId: startNode.getId(),
			relativeX: startAnchor.x,
			relativeY: startAnchor.y,
		};
		const endPointData: ControlPointData = {
			pointType: "Fixed",
			itemId: endNode.getId(),
			relativeX: endAnchor.x,
			relativeY: 0,
		};
		connectorData.startPoint = startPointData;
		connectorData.endPoint = endPointData;

		board.add(board.createItem(board.getNewItemId(), connectorData));
	};

	function calculateNodePosition(
		newNode: AINode,
		selectedNode: AINode,
	): { newItem: AINode; connectorData: ConnectorData } {
		const connectorStorage = new SessionStorage();
		const currMbr = selectedNode.getMbr();
		const currData = selectedNode.serialize();
		const newNodeData = newNode.serialize();
		const width = 700;
		const height = 100;

		const iterAdjustment = { x: -2 * width, y: 0 };

		const baseAdjustments = { translateX: 0, translateY: height };

		if (newNodeData.transformation) {
			newNodeData.transformation.translateX =
				baseAdjustments.translateX + currData.transformation.translateX;
			newNodeData.transformation.translateY =
				baseAdjustments.translateY +
				currData.transformation.translateY +
				currMbr.getHeight();
		}
		const newMbr = currMbr
			.copy()
			.getTransformed(
				new Matrix(
					baseAdjustments.translateX,
					baseAdjustments.translateY + currMbr.getHeight(),
				),
			);

		let step = 1;
		while (
			board.index
				.getItemsEnclosedOrCrossed(
					newMbr.left,
					newMbr.top,
					newMbr.right,
					newMbr.bottom,
				)
				.filter(item => item.itemType !== "Connector").length > 0
		) {
			const direction = step % 2 === 0 ? -1 : 1;
			newMbr.transform(
				new Matrix(
					iterAdjustment.x * direction * step,
					iterAdjustment.y * direction * step,
				),
			);
			if (newNodeData.transformation) {
				newNodeData.transformation.translateX +=
					iterAdjustment.x * direction * step;
				newNodeData.transformation.translateY +=
					iterAdjustment.y * direction * step;
			}
			step += 1;
		}

		const endPoint = getEndPointPosition(newMbr);

		const connectorEndPoint = endPoint || new Point();
		const newItem = board.createItem(board.getNewItemId(), newNodeData);

		const defaultConnector = new Connector(board);
		const connectorData = defaultConnector.serialize();
		connectorData.lineStyle = "orthogonal";

		const savedStart = connectorStorage.getConnectorPointer("start");
		if (savedStart) {
			connectorData.startPointerStyle = savedStart;
		}
		const savedEnd = connectorStorage.getConnectorPointer("end");
		if (savedEnd) {
			connectorData.endPointerStyle = savedEnd;
		}
		connectorData.text = new RichText(new Mbr()).serialize();

		return {
			newItem,
			connectorData,
		};
	}

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
		// if ((account.billingInfo?.remainingTokens ?? 0) <= 0) {
		// 	setIsShaking(true);
		// 	setTimeout(() => {
		// 		setIsShaking(false);
		//
		// 		if (isMediaMatches) {
		// 			navigate("/user/plan");
		// 		} else {
		// 			openModal(USER_PLAN_MODAL_ID);
		// 		}
		// 	}, 1000);
		// 	return;
		// }
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
		parentNode?: AINode,
	): { node: AINode; connectorData: ConnectorData | null } {
		const node = new AINode(isUserRequest, parentNode?.getId());
		node.getRichText().setMaxWidth(600);
		node.getRichText().setSelectionHorisontalAlignment("left");
		node.getRichText().editor.insertCopiedText(inputValue);

		if (!parentNode) {
			const cameraMbr = board.camera.getMbr();

			const centerX = cameraMbr.getCenter().x;
			const centerY = cameraMbr.getCenter().y;
			node.transformation.translateTo(centerX, centerY);
			return {
				node: board.createItem(board.getNewItemId(), node.serialize()),
				connectorData: null,
			};
		}
		const { newItem, connectorData } = calculateNodePosition(
			node,
			parentNode,
		);
		return { node: newItem, connectorData };
	}

	const sendInputData = () => {
		const connection = app.getConnection();
		if (!connection) {
			console.error("Ws no open");
		}

		const selectedNode = board.selection.items.getItemsByItemTypes([
			"AINode",
		])[0];

		const requestNode = createNode(board, inputValue, true, selectedNode);
		const requestAdded = board.add(requestNode.node);

		if (requestNode.connectorData) {
			board.add(
				board.createItem(board.getNewItemId(), {
					...requestNode.connectorData,
					startPoint: getControlPointData(selectedNode, 3),
					endPoint: getControlPointData(requestAdded, 2),
				}),
			);
		}

		const responseNode = createNode(board, "", false, requestAdded);
		const responseAdded = board.add(responseNode.node);

		if (responseNode.connectorData) {
			board.add(
				board.createItem(board.getNewItemId(), {
					...responseNode.connectorData,
					startPoint: getControlPointData(requestAdded, 3),
					endPoint: getControlPointData(responseAdded, 2),
				}),
			);
		}

		const selectedItems = board.selection.items.list();
		const boardContext = selectedItems
			.map(item => {
				if (item.itemType === "AINode") {
					return "";
				}
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
				requestItemId: requestAdded.getId(),
				contextRequest: selectedNode
					? {
							range: 5,
							messageId: selectedNode.getId(),
						}
					: undefined,
			},
		};

		connection.wsClient.send(message);

		setInputValue("");

		if (inputRef.current) {
			inputRef.current.style.height = "auto";
		}

		const mbrToFit = responseAdded.getMbr().combine(requestAdded.getMbr());
		board.camera.zoomToFit(mbrToFit, (600 / mbrToFit.getWidth()) * 30);
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
