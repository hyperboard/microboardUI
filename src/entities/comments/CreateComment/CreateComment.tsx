import React, { useRef, useState } from "react";
import { useDomMbr } from "App/useDomMbr";
import { useAppContext } from "features/AppContext";
import { Comment } from "microboard-temp";
import styles from "./CreateComment.module.css";
import clsx from "clsx";
import { CommentInput } from "../CommentInput/CommentInput";
import { useAccount } from "App/useAccount";

interface Props {
  comment: Comment;
  className?: string;
}

export const CreateComment = ({
  comment,
  className,
}: Props): React.JSX.Element => {
  const formRef = useRef<null | HTMLDivElement>(null);
  const [value, setValue] = useState("");
  const { app, board } = useAppContext();
  const account = useAccount();
  const mbr = useDomMbr({
    app,
    board,
    ref: formRef,
    targetMbr: comment.getMbr(),
    subjects: ["camera", "selection"],
    fit: "threadPanel",
  });

  const handleSubmit = (): void => {
    const accountInfo = account.info;
    if (!accountInfo?.id) {
      return;
    }
    comment.saveMessage(
      value,
      accountInfo.name,
      accountInfo.id,
      accountInfo.avatar,
    );
  };

  const handleReject = (): void => {
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
