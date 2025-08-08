import { Comment } from "microboard-temp";
import { useRef } from "react";

type MergeComments = { clusters: Comment[][]; singleComments: Comment[] };

const mergeComments = (
	comments: Comment[],
	threshold: number,
	scale: number,
	existingClusters?: Comment[][],
): MergeComments => {
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

			if (
				distance <= threshold &&
				(distance > 5 || (distance <= 5 && scale < 5))
			) {
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

export const useCommentsMerge = (
	comments: Comment[],
	cameraScale: number,
): MergeComments => {
	const prevScale = useRef<number>(cameraScale);
	const existingClusters = useRef<Comment[][]>([]);
	const { clusters, singleComments } = mergeComments(
		comments,
		56 / cameraScale,
		cameraScale,
		prevScale.current > cameraScale ? existingClusters.current : undefined,
	);
	existingClusters.current = clusters;
	prevScale.current = cameraScale;
	return { clusters, singleComments };
};
