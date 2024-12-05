import { useAccount } from "App/useAccount";
import React from "react";
import { AddComment } from "../Buttons/AddComment";
import { TogglePresenceRender } from "../Buttons/TogglePresenceRender/TogglePresenceRender";
import styles from "./ActionButtons.module.css";
import { useAppContext } from "View/AppContext";

export const ActionButtons: React.FC = () => {
	const { board } = useAppContext();
	const account = useAccount();

	const isBoardOpen = board.getBoardId() !== "blank";
	return (
		<div className={styles.wrapper}>
			{(account.info?.name || account.info?.email) && <AddComment />}
			{isBoardOpen && <TogglePresenceRender />}
		</div>
	);
};
