import React, { useEffect, useRef, useState, type SyntheticEvent } from "react";
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
	Matrix,
	Mbr,
	Point,
	RichText,
	Shape,
} from "Board/Items";
import { useForceUpdate } from "lib/useForceUpdate";
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
import { getCorrectEnding } from "utils";
import { Sticker } from "Board/Items/Sticker/Sticker";

type PossibleParentNode = AINode | Shape | RichText | Sticker;
const DEFAULT_MAX_NODE_WIDTH = 620;

const getTextFromItem = (item: Item) => {
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
};

const getIdeaFromSelection = (
	selectionItems: Item[],
): { item: PossibleParentNode; idea: string } | null => {
	if (selectionItems.length === 0) {
		return null;
	}
	for (const item of selectionItems) {
		switch (item.itemType) {
			case "RichText":
			case "Sticker":
			case "Shape":
				const text = getTextFromItem(item);
				if (text.trim().length !== 0) {
					return { item, idea: text };
				}
		}
	}
	return null;
};

export const AIInput: React.FC = () => {
	const { t } = useTranslation();
	const { app, board } = useAppContext();
	const [inputValue, setInputValue] = useState("");
	const inputRef = useRef<HTMLTextAreaElement | null>(null);
	const [model, setModel] = useState<OpenAIModels>();
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement | null>(null);
	const forceUpdate = useForceUpdate();
	const selectedItemsCount = board.selection.items.list().length;
	const account = useAccount();
	const { openModal } = useUiModalContext();
	const [isShaking, setIsShaking] = useState(false);
	const [responseNodeId, setResponseNodeId] = useState<string | null>(null);
	const [isGenerating, setIsGenerating] = useState(false);
	const navigate = useNavigate();
	const isMediaMatches = useMediaQuery("(max-width: 1170px)");

	const ideaFromSelection = getIdeaFromSelection(
		board.selection.items.list(),
	);
	const isEditable = board.getInterfaceType() !== "view";

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

	function calculateNodePosition(
		newNode: AINode,
		selectedItem: PossibleParentNode,
		isResponseNode: boolean,
	): { newItem: AINode; connectorData: ConnectorData } {
		const connectorStorage = new SessionStorage();
		const currMbr = selectedItem.getMbr();
		const currData = selectedItem.serialize();
		const newNodeData = newNode.serialize();
		const width = DEFAULT_MAX_NODE_WIDTH;
		const height = 100;

		const iterAdjustment = { x: -2 * width, y: 0 };

		const baseAdjustments = {
			translateX: currMbr.getWidth() / 2,
			translateY: height,
		};
		const adjustmentPoint = new Point(
			baseAdjustments.translateX + currMbr.left,
			baseAdjustments.translateY + currMbr.top,
		);

		newNodeData.adjustmentPoint = adjustmentPoint;

		if (newNodeData.transformation) {
			if (isResponseNode) {
				newNodeData.transformation.translateX = adjustmentPoint.x;
			} else {
				newNodeData.transformation.translateX =
					baseAdjustments.translateX +
					(currData.transformation?.translateX || 0);
			}
			newNodeData.transformation.translateY =
				baseAdjustments.translateY +
				(currData?.transformation?.translateY || 0) +
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
			if (newNodeData.adjustmentPoint) {
				newNodeData.adjustmentPoint.transform(
					new Matrix(iterAdjustment.x * direction * step, 0),
				);
			}
			step += 1;
		}

		const newItem = board.createItem(
			board.getNewItemId(),
			newNodeData,
		) as AINode;

		newItem.transformation.translateBy(-newItem.getMbr().getWidth() / 2, 0);

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

	useEffect(() => {
		if (!account.billingInfo?.models) {
			return;
		}
		const defaultModel = account.billingInfo?.models.find(
			model => model.isDefault && model.isEnabled,
		);

		const dm = defaultModel?.id
			.replace(/^gpt-/, "GPT-")
			.replace("-mini", " mini");
		setModel((dm as OpenAIModels) ?? "GPT4o-mini");
	}, [account.billingInfo?.models]);

	const handleSendClick = async (ev: SyntheticEvent) => {
		ev.stopPropagation();
		if (!inputValue.trim() && !ideaFromSelection) {
			return;
		}
		if (!account.isLoggedIn) {
			return openModal(AI_UNAVAILABLE_MODAL_ID);
		}
		await account.fetchBillingInfo();
		const currentModel = account.billingInfo?.models.find(
			({ id }) => id === model,
		);

		if (
			!currentModel ||
			((currentModel.limits.daily.remaining ?? 0) <= 0 &&
				(currentModel.limits.weekly.remaining ?? 0) <= 0)
		) {
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
		await sendInputData();
		setIsGenerating(false);
	};

	const handleInputClick = (event: React.MouseEvent<HTMLTextAreaElement>) => {
		event.stopPropagation();
		if (board.selection.getContext() === "EditTextUnderPointer") {
			board.selection.setContext("EditUnderPointer");
		}
		if (isDropdownOpen) {
			setIsDropdownOpen(false);
		}
	};

	const handleKeyDown = async (
		event: React.KeyboardEvent<HTMLTextAreaElement>,
	) => {
		event.stopPropagation();
		if (event.key === "Enter" && !event.shiftKey) {
			event.preventDefault();
			await handleSendClick(event);
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
		parentItem?: PossibleParentNode,
		withPlaceholder = false,
	): { node: AINode; connectorData: ConnectorData | null } {
		let parentNodeId: string | undefined;
		if (parentItem && parentItem.itemType === "AINode") {
			parentNodeId = parentItem.getId();
		}

		const node = new AINode(isUserRequest, parentNodeId);
		const nodeRichText = node.getRichText();
		nodeRichText.setMaxWidth(600);
		nodeRichText.setSelectionHorisontalAlignment("left");
		nodeRichText.container.right = nodeRichText.container.left + 600;

		if (withPlaceholder) {
			nodeRichText.placeholderText =
				"...............................................................................................................................................................................................";
		} else {
			nodeRichText.editor.insertCopiedText(inputValue);
		}

		if (!parentItem) {
			const cameraMbr = board.camera.getMbr();

			const centerX = cameraMbr.getCenter().x;
			const centerY = cameraMbr.getCenter().y;
			node.transformation.translateTo(centerX, centerY);
			return {
				node: board.createItem(
					board.getNewItemId(),
					node.serialize(),
				) as AINode,
				connectorData: null,
			};
		}
		const { newItem, connectorData } = calculateNodePosition(
			node,
			parentItem,
			!isUserRequest,
		);
		return { node: newItem, connectorData };
	}

	const sendInputData = async () => {
		const connection = app.getConnection();
		if (!connection) {
			console.error("Ws no open");
		}

		if (!inputValue.trim().length && !ideaFromSelection) {
			return;
		}

		const nodeWithParents =
			board.selection.getMostNestedAINodeWithParents();

		let idea = inputValue;
		let itemToContinueThread: Item | undefined = nodeWithParents?.node;
		if (idea.trim().length === 0) {
			if (!ideaFromSelection) {
				return;
			}
			idea = ideaFromSelection.idea;
			if (!itemToContinueThread) {
				itemToContinueThread = ideaFromSelection.item;
			}
		}

		const requestNode = createNode(board, idea, true, itemToContinueThread);
		const requestAdded = board.add(requestNode.node);

		if (requestNode.connectorData && itemToContinueThread) {
			board.add(
				board.createItem(board.getNewItemId(), {
					...requestNode.connectorData,
					startPoint: getControlPointData(itemToContinueThread, 3),
					endPoint: getControlPointData(requestAdded, 2),
				}),
			);
		}

		const responseNode = createNode(
			board,
			"Waiting for response...",
			false,
			requestAdded,
			true,
		);
		const responseAdded = board.add(responseNode.node);

		setResponseNodeId(responseAdded.getId());

		if (responseNode.connectorData) {
			board.add(
				board.createItem(board.getNewItemId(), {
					...responseNode.connectorData,
					startPoint: getControlPointData(requestAdded, 3),
					endPoint: getControlPointData(responseAdded, 2),
				}),
			);
		}

		const parentNodes = nodeWithParents
			? [nodeWithParents.node, ...nodeWithParents.parents]
			: [];

		const selectedItems = board.selection.items.list();

		const boardContext = selectedItems
			.filter(item => item.getId() !== ideaFromSelection?.item.getId())
			.map(item => {
				if (
					item.itemType === "AINode" &&
					parentNodes.length &&
					parentNodes.find(node => node.getId() === item.getId())
				) {
					return "";
				}
				return getTextFromItem(item);
			})
			.filter(text => text !== "");

		const contextRequest = nodeWithParents
			? {
					range: 5,
					messageId: nodeWithParents.node.getId(),
				}
			: undefined;

		const message: AiChatMsg<UserRequest> = {
			type: "AiChat",
			boardId: board.getBoardId(),
			event: {
				method: "UserRequest",
				context: [],
				boardContext,
				idea,
				model,
				itemId: responseAdded.getId(),
				requestItemId: requestAdded.getId(),
				contextRequest,
			},
		};

		connection.wsClient.send(message);

		setInputValue("");
		setIsGenerating(true);

		if (inputRef.current) {
			inputRef.current.style.height = "auto";
		}

		const mbrToFit = responseAdded.getMbr().combine(requestAdded.getMbr());
		board.camera.zoomToFit(mbrToFit, (600 / mbrToFit.getWidth()) * 30);
	};

	const stopStream = async (boardId: string, itemId: string) => {
		const connection = app.getConnection();
		const stopMessage: AiChatMsg<{
			method: "StopGeneration";
			itemId: string;
		}> = {
			type: "AiChat",
			boardId: boardId,
			event: {
				method: "StopGeneration",
				itemId: itemId,
			},
		};

		connection.wsClient.send(stopMessage);
		await account.fetchBillingInfo();
	};

	const handleStopClick = async () => {
		const boardId = board.getBoardId();

		if (responseNodeId) {
			await stopStream(boardId, responseNodeId);
			setIsGenerating(false);
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
						{model !== "gpt-4o" && model !== "gpt-4o-mini" && (
							<span>{model}</span>
						)}
						{model === "gpt-4o" && (
							<span>{isPhoneScreen ? "4o" : model}</span>
						)}
						{model === "gpt-4o-mini" && (
							<span>{isPhoneScreen ? "4o-mini" : model}</span>
						)}
						<Chevron
							className={clsx(
								isDropdownOpen ? styles.activeArrow : "",
								styles.arrow,
							)}
						/>
					</div>
					<StarIcon
						className={styles.starIcon}
						width={20}
						height={20}
					/>
					{isDropdownOpen && (
						<div className={styles.modelDropdown}>
							<button
								disabled={
									!account.billingInfo?.models.find(
										model =>
											model.id === "gpt-4o-mini" &&
											model.isEnabled,
									)
								}
								className={styles.modelBtn}
								onClick={() => selectModel("gpt-4o-mini")}
							>
								<strong>GPT-4o mini</strong>
								<p>{t("ai.models.gpt-4o-mini.description")}</p>
							</button>
							<button
								disabled={
									!account.billingInfo?.models.find(
										model =>
											model.id === "gpt-4o" &&
											model.isEnabled,
									)
								}
								className={styles.modelBtn}
								onClick={() => selectModel("gpt-4o")}
							>
								<strong>GPT-4o</strong>
								<p>{t("ai.models.gpt-4o.description")}</p>
							</button>
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
					placeholder={
						isPhoneScreen
							? t("AIInput.selectMobileContext")
							: t("AIInput.selectContext")
					}
					className={styles.aiInput}
					ref={inputRef}
					rows={1}
					disabled={!isEditable}
					title={!isEditable ? t("AIInput.disable") : ""}
				/>
				<div
					className={clsx(
						styles.selectionInfo,
						selectedItemsCount && styles.activeSelection,
					)}
				>
					{t(
						`AIInput.selectedItems.${getCorrectEnding(selectedItemsCount)}`,
						{ count: selectedItemsCount },
					)}
				</div>
				<button
					onClick={isGenerating ? handleStopClick : handleSendClick}
					className={styles.sendButton}
					disabled={!isEditable}
				>
					<Icon
						width={20}
						height={20}
						iconName={isGenerating ? "StopAiGeneration" : "Vector"}
						className={clsx(
							styles.icon,
							(inputValue.trim() || ideaFromSelection) &&
								styles.activeIcon,
						)}
					/>
				</button>
			</div>
		</UiPanel>
	);
};
