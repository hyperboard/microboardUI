import {
	createStrictContext,
	useStrictContext,
} from "shared/lib/strictContext";
import React, { useState } from "react";
import { Comment } from "Board/Items/Comment/Comment";

interface Context {
	openedThreadId: string | undefined;
	setOpenedThreadId: (id: string | undefined) => void;
	showResolved: boolean;
	setShowResolved: (arg: boolean) => void;
	showComments: boolean;
	setShowComments: (arg: boolean) => void;
	enableClusters: boolean;
	setEnableClusters: (arg: boolean) => void;
	targetMessageId: string | undefined;
	setTargetMessageId: (id: string | undefined) => void;
	movingComment: Comment | null;
	setMovingComment: (id: Comment | null) => void;
}

export const CommentsContext = createStrictContext<Context>();

export function useCommentsContext() {
	return useStrictContext(CommentsContext);
}

interface Props {
	children: React.ReactNode;
}

export const CommentsContextProvider = ({ children }: Props): JSX.Element => {
	const [openedThreadId, setOpenedThreadId] = useState<string | undefined>(
		undefined,
	);
	const [showResolved, setShowResolved] = useState(false);
	const [showComments, setShowComments] = useState(true);
	const [enableClusters, setEnableClusters] = useState(true);
	const [targetMessageId, setTargetMessageId] = useState<string | undefined>(
		undefined,
	);
	const [movingComment, setMovingComment] = useState<Comment | null>(null);

	return (
		<CommentsContext.Provider
			value={{
				openedThreadId,
				setOpenedThreadId,
				showResolved,
				setShowResolved,
				setShowComments,
				showComments,
				setEnableClusters,
				enableClusters,
				targetMessageId,
				setTargetMessageId,
				movingComment,
				setMovingComment,
			}}
		>
			{children}
		</CommentsContext.Provider>
	);
};
