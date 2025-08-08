import { Icon } from "shared/ui-lib/Icon";
import React, { SyntheticEvent } from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "features/AppContext";
import btnStyle from "./ContextPanelButton.module.css";
import { useAIContext } from "entities/AIInput/AIContext";
import { getIdeaFromSelection } from "entities/AIInput";
import { useAccount } from "App/useAccount";
import { UiButton } from "shared/ui-lib/UiButton";

type Props = {
	rounded?: "left" | "right" | "none" | "full";
};

export function AIGeneration({ rounded = "none" }: Props): React.ReactElement {
	const { board } = useAppContext();
	const { t } = useTranslation();
	const account = useAccount();
	const { stopStream, responseNodeId, tryToSendGenerationRequest } =
		useAIContext();

	const ideaFromSelection = getIdeaFromSelection(
		board.selection.items.list(),
	);

	const handleClick = async (ev: SyntheticEvent): Promise<void> => {
		ev.stopPropagation();
		if (!ideaFromSelection) {
			return;
		}
		await tryToSendGenerationRequest();
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
