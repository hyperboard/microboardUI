import React, { useRef, useState } from "react";
import { useDomMbr } from "Board/Items/Mbr/useDomMbr";
import { useAppContext } from "View/AppContext";
import { Comment } from "Board/Items/Comment/Comment";
import styles from "./CreateComment.module.css";
import clsx from "clsx";
import { CommentInput } from "../CommentInput/CommentInput";

interface Props {
	comment: Comment;
	className?: string;
}

export const CreateComment = ({ comment, className }: Props) => {
	const formRef = useRef<null | HTMLDivElement>(null);
	const [value, setValue] = useState("");
	const { app, board } = useAppContext();
	const mbr = useDomMbr({
		app,
		board,
		ref: formRef,
		targetMbr: comment.getMbr(),
		subjects: ["camera", "selection"],
		fit: "threadPanel",
	});

	const handleSubmit = () => {
		const accountInfo = app.account.info;
		comment.saveMessage(
			value,
			accountInfo?.name || accountInfo?.email,
			accountInfo?.avatar,
		);
	};

	const handleReject = () => {
		return board.tools.addComment(true);
	};

	return (
		<div
			ref={formRef}
			className={clsx(styles.form, className)}
			style={{
				position: "absolute",
				left: mbr.left,
				top: mbr.top,
				zIndex: "4",
			}}
		>
			<CommentInput
				mode="create"
				value={value}
				handleReject={handleReject}
				setValue={setValue}
				handleSubmit={handleSubmit}
			/>
		</div>
	);
};
