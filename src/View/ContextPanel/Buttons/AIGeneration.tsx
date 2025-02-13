import { Icon } from "View/Icon";
import { UiButton } from "View/Ui/UiButton/UiButton";
import React from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "View/AppContext";
import btnStyle from "./ContextPanelButton.module.css";
import { AI_UNAVAILABLE_MODAL_ID } from "View/AiUnavailableModal/AiUnavailableModal";
import { USER_PLAN_MODAL_ID } from "View/UserPlan/UserPlanModal";
import { useNavigate } from "react-router-dom";
import { useMediaQuery } from "lib/useMediaQuery";
import { useAIContext } from "View/AIInput/AIContext";
import { getContextItems, getIdeaFromSelection } from "View/AIInput";
import { useAccount } from "App/useAccount";
import { useUiModalContext } from "View/Ui/UiModal/UiModalContext";
import { AiChatMsg, GenerateImageRequest, UserRequest } from "App/Connection";

type Props = {
	rounded?: "left" | "right" | "none" | "full";
};

export function AIGeneration({ rounded = "none" }: Props): React.ReactElement {
	const { board, app } = useAppContext();
	const { t } = useTranslation();
	const navigate = useNavigate();
	const isMediaMatches = useMediaQuery("(max-width: 1170px)");
	const account = useAccount();
	const { openModal } = useUiModalContext();
	const { stopStream, responseNodeId, model, createNodesWithConnectors } =
		useAIContext();

	const ideaFromSelection = getIdeaFromSelection(
		board.selection.items.list(),
	);

	const handleClick = async (): Promise<void> => {
		if (!ideaFromSelection) {
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
			(currentModel.limits.daily.remaining !== null &&
				currentModel.limits.daily.remaining <= 0) ||
			(currentModel.limits.weekly.remaining !== null &&
				currentModel.limits.weekly.remaining <= 0)
		) {
			if (isMediaMatches) {
				navigate("/user/plan");
			} else {
				openModal(USER_PLAN_MODAL_ID);
			}
			return;
		}
		board.aiGeneratingOnItem = "unknown";
		await sendGenerationRequest();
	};

	const sendGenerationRequest = async () => {
		const connection = app.getConnection();
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
			selectedItems,
			parentNodes,
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

	const handleStopClick = async () => {
		const boardId = board.getBoardId();

		if (responseNodeId) {
			await stopStream(boardId, responseNodeId, account);
			board.aiGeneratingOnItem = undefined;
		}
	};

	return (
		<UiButton
			className={btnStyle.contextPanelButton}
			id={"AIGeneration"}
			onClick={board.aiGeneratingOnItem ? handleStopClick : handleClick}
			variant="secondary"
			rounded={rounded}
			tooltip={t(
				board.aiGeneratingOnItem
					? "contextPanel.ai.stop"
					: "contextPanel.ai.tooltip",
			)}
			tooltipPosition="top"
		>
			{board.aiGeneratingOnItem ? (
				<Icon
					iconName="StopAiGeneration"
					style={{ color: "#924fe8" }}
				/>
			) : (
				<Icon
					iconName="AIChatSendArrow"
					width={20}
					height={20}
					style={{ color: "#924fe8" }}
				/>
			)}
		</UiButton>
	);
}
