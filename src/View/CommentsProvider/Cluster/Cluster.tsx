import React, { useEffect, useRef } from "react";
import { useDomMbr } from "Board/Items/Mbr/useDomMbr";
import { useAppContext } from "View/AppContext";
import styles from "./Cluster.module.css";
import { Comment } from "Board/Items/Comment/Comment";
import { Mbr } from "Board/Items/Mbr/Mbr";
import { Icon } from "View/Icon/Icon";
import clsx from "clsx";
import { useAccount } from "App/useAccount";

interface Props {
	comments: Comment[];
}

export const Cluster = ({ comments }: Props) => {
	const clusterRef = useRef<HTMLDivElement>(null);
	const { board, app } = useAppContext();
	const account = useAccount();

	const mbr = useDomMbr({
		app,
		board,
		ref: clusterRef,
		targetMbr: comments[0].getAnchorMbr(),
		subjects: ["camera", "selectionItem"],
		fit: "comment",
	});

	useEffect(() => {
		if (clusterRef.current) {
			clusterRef.current.addEventListener(
				"wheel",
				app.controller.onWheel,
				{
					capture: true,
					passive: false,
				},
			);
		}

		return () => {
			if (clusterRef.current) {
				clusterRef.current.removeEventListener(
					"wheel",
					app.controller.onWheel,
				);
			}
		};
	}, []);

	// TODO const
	// const mergeDistance = 60;

	const handleClick = () => {
		const mbrToFit = new Mbr();
		comments.forEach(comment => {
			const anchor = comment.getAnchorPoint();
			if (anchor.x > mbrToFit.right || mbrToFit.right === 0) {
				mbrToFit.right = anchor.x;
			}
			if (anchor.x < mbrToFit.left || mbrToFit.left === 0) {
				mbrToFit.left = anchor.x;
			}
			if (anchor.y > mbrToFit.bottom || mbrToFit.bottom === 0) {
				mbrToFit.bottom = anchor.y;
			}
			if (anchor.y < mbrToFit.top || mbrToFit.top === 0) {
				mbrToFit.top = anchor.y;
			}
		});
		mbrToFit.right = mbrToFit.right + mbrToFit.getWidth();
		mbrToFit.left = mbrToFit.left - mbrToFit.getWidth();
		mbrToFit.top = mbrToFit.top - mbrToFit.getHeight();
		mbrToFit.bottom = mbrToFit.bottom + mbrToFit.getHeight();
		board.camera.zoomToFit(mbrToFit);
	};

	const hasUnreadMessages = comments.some(comment =>
		comment.getUnreadMessages(account.info?.name || account.info?.email),
	);

	return (
		<div
			ref={clusterRef}
			onClick={handleClick}
			className={clsx(styles.cluster, hasUnreadMessages && styles.unread)}
			style={{
				left: mbr.left,
				top: mbr.top,
			}}
		>
			<p>{comments.length}</p>
			<Icon
				width={18}
				height={8}
				iconName={"CommentTippy"}
				className={styles.clusterTippy}
			/>
		</div>
	);
};
