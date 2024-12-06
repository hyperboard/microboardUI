import React from "react";
import { useAppSubscription } from "Board/useBoardSubscription";
import { useForceUpdate } from "lib/useForceUpdate";
import { useAppContext } from "../AppContext";
import { CommentContainer } from "./CommentContainer/CommentContainer";
import { CreateComment } from "./CreateComment/CreateComment";
import styles from "./CommentsProvider.module.css";
import { Cluster } from "./Cluster/Cluster";
import { useCommentsMerge } from "./useCommentsMerge";
import { useCommentsContext } from "View/CommentsProvider/CommentsContext";

export const CommentsProvider = () => {
	const { app, board } = useAppContext();
	const { showResolved, showComments, enableClusters, movingComment } =
		useCommentsContext();

	const forceUpdate = useForceUpdate();
	const commentToAdd = board.tools.getAddComment()?.comment;
	let showCreateComment = false;

	useAppSubscription({
		subjects: ["items", "camera", "tools", "selectionItems", "selection"],
		observer: () => {
			forceUpdate();
		},
	});

	const comments = board.items.getComments().filter(comment => {
		const threadLength = comment.getThread().length;
		if (threadLength === 0) {
			showCreateComment = comment.getId() === commentToAdd?.getId();
			return false;
		}
		return showResolved ? true : !comment.getResolved();
	});

	const { clusters, singleComments } = useCommentsMerge(
		comments.filter(
			comment =>
				comment !== movingComment && !comment.transformationRenderBlock,
		),
		board.camera.getScale(),
	);

	if (!showComments) {
		return <></>;
	}

	const commentsToShow = enableClusters ? singleComments : comments;
	if (movingComment) {
		commentsToShow.push(movingComment);
	}

	return (
		<>
			{commentsToShow.map(comment => {
				return (
					<CommentContainer comment={comment} key={comment.getId()} />
				);
			})}
			return (
			{showCreateComment && (
				<CreateComment
					className={styles.createComment}
					comment={commentToAdd}
				/>
			)}
			{enableClusters &&
				clusters.map(cluster => (
					<Cluster key={cluster[0].getId()} comments={cluster} />
				))}
		</>
	);
};
