import { Comment } from "../../Board/Items/Comment";
import { useMemo, useRef } from "react";

const mergeComments = (
	comments: Comment[],
	threshold: number,
	existingClusters?: Comment[][],
) => {
	const clusters: Comment[][] = [];
	const singleComments: Comment[] = [];
	const processed: Set<Comment> = new Set();
	for (let i = 0; i < comments.length; i++) {
		const baseComment = comments[i];

		if (processed.has(baseComment)) {
			continue;
		}
		let currentCluster = [baseComment];
		if (existingClusters) {
			const baseCluster = existingClusters.find(cluster =>
				cluster.includes(baseComment),
			);
			if (baseCluster) {
				currentCluster = baseCluster;
				baseCluster.forEach(comment => processed.add(comment));
			}
		}

		for (let j = i + 1; j < comments.length; j++) {
			const otherComment = comments[j];

			if (processed.has(otherComment)) {
				continue;
			}
			const distance = baseComment.getDistanceToPoint(
				otherComment.getAnchorPoint(),
			);

			if (distance <= threshold) {
				if (existingClusters) {
					const targetCluster = existingClusters.find(cluster =>
						cluster.includes(otherComment),
					);
					if (targetCluster) {
						currentCluster.push(...targetCluster);
						targetCluster.forEach(comment =>
							processed.add(comment),
						);
						continue;
					}
				}
				currentCluster.push(otherComment);
				processed.add(otherComment);
			}
		}

		if (currentCluster.length > 1) {
			clusters.push(currentCluster);
		} else {
			singleComments.push(currentCluster[0]);
		}
	}

	return { clusters, singleComments };
};

export const useCommentsMerge = (comments: Comment[], cameraScale: number) => {
	const prevScale = useRef<number>(cameraScale);
	const existingClusters = useRef<Comment[][]>([]);
	const { clusters, singleComments } = mergeComments(
		comments,
		56 / cameraScale,
		prevScale.current > cameraScale ? existingClusters.current : undefined,
	);
	existingClusters.current = clusters;
	prevScale.current = cameraScale;
	return { clusters, singleComments };
};
