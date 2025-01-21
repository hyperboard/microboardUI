import { createStrictContext, useStrictContext } from "lib/strictContext";
import React, { useState } from "react";
import { AiChatMsg, OpenAIModels } from "App/Connection";
import { useAppContext } from "View/AppContext";
import { Account } from "App/Account";
import { getControlPointData } from "Board/Selection/QuickAddButtons/quickAddHelpers";
import { createNode, PossibleParentNode } from "View/AIInput/utils";
import { AINode } from "Board/Items/AINode/AINode";

interface Context {
	stopStream: (
		boardId: string,
		itemId: string,
		account: Account,
	) => Promise<void>;
	model: OpenAIModels;
	setModel: (model: OpenAIModels) => void;
	query: string;
	setQuery: (value: string) => void;
	responseNodeId: string | undefined;
	setResponseNodeId: (nodeId: string) => void;
	createNodesWithConnectors: (
		idea: string,
		itemToContinueThread?: PossibleParentNode,
		isIdeaFromInput?: boolean,
	) => { responseAdded: AINode; requestAdded: AINode };
}

export const AIContext = createStrictContext<Context>();

export function useAIContext() {
	return useStrictContext(AIContext);
}

interface Props {
	children: React.ReactNode;
}

export const AIContextProvider = ({ children }: Props): JSX.Element => {
	const { app, board } = useAppContext();
	const [model, setModel] = useState<OpenAIModels>("gpt-4o-mini");
	const [responseNodeId, setResponseNodeId] = useState<string | undefined>();
	const [query, setQuery] = useState("");

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
		setTimeout(() => {
			connection.wsClient.send(stopMessage);
		}, 10000);
	};

	function createNodesWithConnectors(
		idea: string,
		itemToContinueThread?: PossibleParentNode,
		isIdeaFromInput = true,
	) {
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
			);
			requestAdded = board.add(requestNode.node);

			if (requestNode.connectorData && itemToContinueThread) {
				board.add(
					board.createItem(board.getNewItemId(), {
						...requestNode.connectorData,
						startPoint: getControlPointData(
							itemToContinueThread,
							3,
						),
						endPoint: getControlPointData(requestAdded, 2),
					}),
				);
			}
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
		return { responseAdded, requestAdded };
	}

	return (
		<AIContext.Provider
			value={{
				query,
				setQuery,
				stopStream,
				model,
				setModel,
				responseNodeId,
				setResponseNodeId,
				createNodesWithConnectors,
			}}
		>
			{children}
		</AIContext.Provider>
	);
};
