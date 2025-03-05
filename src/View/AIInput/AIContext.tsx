import { createStrictContext, useStrictContext } from "lib/strictContext";
import React, { useState } from "react";
import {
	AiChatMsg,
	GenerateImageRequest,
	OpenAIModels,
	UserRequest,
} from "App/Connection";
import { useAppContext } from "View/AppContext";
import { Account } from "App/Account";
import { getControlPointData } from "Board/Selection/QuickAddButtons/quickAddHelpers";
import {
	createNode,
	DEFAULT_MAX_NODE_WIDTH,
	getContextItems,
	getIdeaFromSelection,
	PossibleParentNode,
} from "View/AIInput/utils";
import { AINode } from "Board/Items/AINode/AINode";
import { AI_UNAVAILABLE_MODAL_ID } from "View/AiUnavailableModal/AiUnavailableModal";
import { USER_PLAN_MODAL_ID } from "View/UserPlan/UserPlanModal";
import { useAccount } from "App/useAccount";
import { useUiModalContext } from "View/Ui/UiModal/UiModalContext";
import { SessionStorage } from "App/SessionStorage";

interface Context {
	stopStream: (
		boardId: string,
		itemId: string,
		account: Account,
	) => Promise<void>;
	model: OpenAIModels;
	setModel: (model: OpenAIModels) => void;
	responseNodeId: string | undefined;
	setResponseNodeId: (nodeId: string) => void;
	createNodesWithConnectors: (
		idea: string,
		itemToContinueThread?: PossibleParentNode,
		contextItems?: string[],
		isIdeaFromInput?: boolean,
	) => { responseAdded: AINode; requestAdded: AINode };
	quotedText: string | undefined;
	setQuotedText: (text: string | undefined) => void;
	tryToSendGenerationRequest: (
		fallback?: () => void,
		startGenerationCb?: () => Promise<void>,
	) => Promise<void>;
}

export const AIContext = createStrictContext<Context>();

export function useAIContext() {
	return useStrictContext(AIContext);
}

interface Props {
	children: React.ReactNode;
}

const sessionStorage = new SessionStorage();

export const AIContextProvider = ({ children }: Props): JSX.Element => {
	const { app } = useAppContext();
	const [model, setModel] = useState<OpenAIModels>("gpt-4o-mini");
	const [responseNodeId, setResponseNodeId] = useState<string | undefined>();
	const [quotedText, setQuotedText] = useState<string | undefined>();
	const account = useAccount();
	const { openModal } = useUiModalContext();

	const stopStream = async (
		boardId: string,
		itemId: string,
		account: Account,
	) => {
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

	function createNodesWithConnectors(
		idea: string,
		itemToContinueThread?: PossibleParentNode,
		contextItems: string[] = [],
		isIdeaFromInput = true,
	) {
		const board = app.getBoard();
		const reverseIndexMap = { 0: 1, 1: 0, 2: 3, 3: 2 };
		let requestAdded: AINode;
		if (
			itemToContinueThread &&
			itemToContinueThread.itemType === "AINode" &&
			itemToContinueThread.getIsUserRequest() &&
			!isIdeaFromInput
		) {
			requestAdded = itemToContinueThread;
		} else {
			const requestNode = createNode(
				board,
				idea,
				true,
				itemToContinueThread,
				contextItems,
			);
			requestAdded = board.add(requestNode.node);
			const threadDirectionIndex =
				itemToContinueThread?.itemType === "AINode"
					? itemToContinueThread.getThreadDirection()
					: 3;

			if (requestNode.connectorData && itemToContinueThread) {
				board.add(
					board.createItem(board.getNewItemId(), {
						...requestNode.connectorData,
						startPoint: getControlPointData(
							itemToContinueThread,
							threadDirectionIndex,
						),
						endPoint: getControlPointData(
							requestAdded,
							reverseIndexMap[threadDirectionIndex],
						),
					}),
				);
			}
		}

		const responseNode = createNode(
			board,
			"Waiting for response...",
			false,
			requestAdded,
			undefined,
			true,
			model === "image-generation",
		);
		const responseAdded = board.add(responseNode.node);

		if (
			responseAdded.itemType === "AINode" &&
			!responseAdded.text.editor.getStopProcessingMarkDownCb()
		) {
			responseAdded.text.editor.setStopProcessingMarkDownCb(() => {
				board.camera.unsubscribeFromItem();
				board.selection.items.removeAll();
				board.selection.add(responseAdded);
				const itemWidth = responseAdded.getMbr().getWidth();
				if (itemWidth < DEFAULT_MAX_NODE_WIDTH) {
					const offset = (DEFAULT_MAX_NODE_WIDTH - itemWidth) / 2;
					responseAdded.transformation.translateBy(offset, 0);
				}
				board.camera.zoomToFit(responseAdded.getMbr(), 20);
				board.aiGeneratingOnItem = undefined;
			});
		}

		setResponseNodeId(responseAdded.getId());

		board.aiImagePlaceholder = responseAdded;
		const threadDirectionIndex =
			requestAdded?.itemType === "AINode"
				? requestAdded.getThreadDirection()
				: 3;

		if (responseNode.connectorData) {
			const pointer = board.add(
				board.createItem(board.getNewItemId(), {
					...responseNode.connectorData,
					startPoint: getControlPointData(
						requestAdded,
						threadDirectionIndex,
					),
					endPoint: getControlPointData(
						responseAdded,
						reverseIndexMap[threadDirectionIndex],
					),
				}),
			);

			board.aiImageConnectorID = pointer.getId();
		}

		return { responseAdded, requestAdded };
	}

	const tryToSendGenerationRequest = async (
		fallback?: () => void,
		startGenerationCb?: () => Promise<void>,
	) => {
		const board = app.getBoard();
		if (!account.isLoggedIn) {
			return openModal(AI_UNAVAILABLE_MODAL_ID);
		}
		await account.fetchBillingInfo();
		const currentModel = account.billingInfo?.models.find(
			({ id }) => id === model,
		);

		if (
			!currentModel ||
			(currentModel.limits.daily?.remaining != null &&
				currentModel.limits.daily.remaining <= 0) ||
			(currentModel.limits.weekly?.remaining != null &&
				currentModel.limits.weekly.remaining <= 0) ||
			(currentModel.limits.monthly?.remaining != null &&
				currentModel.limits.monthly.remaining <= 0)
		) {
			if (fallback) {
				fallback();
			} else {
				openModal(USER_PLAN_MODAL_ID);
			}
			return;
		}
		board.aiGeneratingOnItem = "unknown";
		sessionStorage.removeLastAIRequest();
		setQuotedText(undefined);
		board.selection.setContext("EditUnderPointer");
		if (startGenerationCb) {
			await startGenerationCb();
		} else {
			await startGeneration();
		}
	};

	const startGeneration = async () => {
		const connection = app.getConnection();
		const board = app.getBoard();
		const ideaFromSelection = getIdeaFromSelection(
			board.selection.items.list(),
		);
		if (!connection) {
			console.error("Ws no open");
			return;
		}

		if (!ideaFromSelection) {
			return;
		}

		const idea = ideaFromSelection.idea;
		const itemToContinueThread = ideaFromSelection.item;

		const nodeWithParents =
			board.selection.getMostNestedAINodeWithParents();

		const parentNodes = nodeWithParents
			? [nodeWithParents.node, ...nodeWithParents.parents]
			: [];

		const selectedItems = board.selection.items.list();

		const { boardContext, contextItems } = getContextItems(
			[
				...selectedItems,
				...parentNodes.filter(node => node.getIsUserRequest()),
			],
			parentNodes.filter(node => !node.getIsUserRequest()),
			ideaFromSelection?.item.getId(),
		);

		const { responseAdded, requestAdded } = createNodesWithConnectors(
			idea,
			itemToContinueThread,
			contextItems.map(item => item.getId()),
			false,
		);

		board.aiGeneratingOnItem = responseAdded.getId();
		board.camera.subscribeToItem(responseAdded);

		if (model === "image-generation") {
			const options = {
				model: "flux-schnell",
				aspect_ratio: "1:1",
			};

			const message: AiChatMsg<GenerateImageRequest> = {
				type: "AiChat",
				boardId: board.getBoardId(),
				event: {
					method: "GenerateImage",
					prompt: idea,
					itemId: responseAdded.getId(),
					options,
				},
			};

			connection.wsClient.send(message);
		} else {
			const contextRequest = nodeWithParents?.lastAssistantMessageId
				? {
						range: 5,
						messageId: nodeWithParents.lastAssistantMessageId,
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
		}

		const itemsInView = board.items.getInView();
		const viewport = board.camera.getMbr();
		const isAiNodesInView = itemsInView.some(item => {
			const itemMbr = item.getMbr();
			return (
				item.getId() === responseAdded.getId() &&
				itemMbr.right < viewport.right &&
				itemMbr.left > viewport.left
			);
		});

		if (!isAiNodesInView) {
			const mbrToFit = responseAdded
				.getMbr()
				.combine(requestAdded.getMbr());
			board.camera.zoomToFit(mbrToFit, (600 / mbrToFit.getWidth()) * 30);
		}
	};

	return (
		<AIContext.Provider
			value={{
				stopStream,
				model,
				setModel,
				responseNodeId,
				setResponseNodeId,
				createNodesWithConnectors,
				quotedText,
				setQuotedText,
				tryToSendGenerationRequest,
			}}
		>
			{children}
		</AIContext.Provider>
	);
};
