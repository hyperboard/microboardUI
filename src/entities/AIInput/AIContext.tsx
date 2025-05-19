import {
	AiChatMsg,
	GenerateImageRequest,
	OpenAIModels,
	UserRequest,
} from "App/Connection";
import { SessionStorage } from "App/SessionStorage";
import { useAccount } from "App/useAccount";
import { AINode } from "Board/Items/AINode/AINode";
import { getControlPointData } from "Board/Selection/QuickAddButtons/quickAddHelpers";
import { conf } from "Board/Settings";
import { Account } from "entities/account";
import {
	createNode,
	getContextItems,
	getIdeaFromSelection,
	PossibleParentNode,
} from "entities/AIInput/utils";
import { AI_UNAVAILABLE_MODAL_ID } from "features/AiUnavailableModal/AiUnavailableModal";
import { useAppContext } from "features/AppContext";
import { USER_PLAN_MODAL_ID } from "features/UserPlan/UserPlanModal";
import React, { useState, type PropsWithChildren } from "react";
import { useTranslation } from "react-i18next";
import {
	createStrictContext,
	useStrictContext,
} from "shared/lib/strictContext";
import { notify } from "shared/ui-lib/Toast";
import { useUiModalContext } from "shared/ui-lib/UiModal";

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
const DEFAULT_NODE_WIDTH = conf.AI_NODE_DEFAULT_NODE_WIDTH;

export function useAIContext() {
	return useStrictContext(AIContext);
}

const sessionStorage = new SessionStorage();

export const AIContextProvider = ({
	children,
}: PropsWithChildren<{}>): JSX.Element => {
	const { t } = useTranslation();
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

		connection.send(stopMessage);
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
			model === "flux-schnell" || model === "flux-pro",
		);
		const responseAdded = board.add(responseNode.node);

		if (
			responseAdded.itemType === "AINode" &&
			!responseAdded.text.editor.markdownProcessor.getStopProcessingMarkDownCb()
		) {
			responseAdded.text.editor.markdownProcessor.setStopProcessingMarkDownCb(
				() => {
					board.camera.unsubscribeFromItem();
					board.selection.items.removeAll();
					board.selection.add(responseAdded);
					const itemWidth = responseAdded.getMbr().getWidth();
					if (itemWidth < DEFAULT_NODE_WIDTH) {
						const offset = (DEFAULT_NODE_WIDTH - itemWidth) / 2;
						responseAdded.transformation.translateBy(offset, 0);
					}
					const mbrToFit = responseAdded.getMbr();
					const offsetX = (640 - mbrToFit.getWidth()) / 2;
					mbrToFit.left -= offsetX;
					mbrToFit.right += offsetX;
					board.camera.zoomToFit(mbrToFit, 20);
					board.aiGeneratingOnItem = undefined;
				},
			);
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
		const balance = account.billingInfo?.tokens.totalTokensBalance || 0;
		const isBasicPlan = account.billingInfo?.plan.planId === "basic";
		console.log("balance", balance);
		const currentModel = account.billingInfo?.models.find(
			({ id }) => id === model,
		);

		if (!currentModel || currentModel.tokenCost > balance) {
			if (!isBasicPlan) {
				notify({
					header: t("tokensNotification.header"),
					body: t("tokensNotification.body", {
						price: "$8",
					}),
					variant: "warning",
				});
			}

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

		if (model === "flux-schnell" || model === "flux-pro") {
			const options = {
				model: model === "flux-pro" ? "flux-pro" : "flux-schnell",
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

			connection.send(message);
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

			connection.send(message);
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
