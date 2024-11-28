import React, { useState } from "react";
import { UiPanel } from "View/Ui/UiPanel";
import { Chat } from "./Chat";
import styles from "./ChatPanel.module.css";
import { Board } from "Board";

interface Props {
	board: Board;
}

export const ChatPanel: React.FC<Props> = ({ board }) => {
	const [isOpen, setIsOpen] = useState(false);

	const toggleChat = (): void => {
		setIsOpen(!isOpen);
	};

	const handleClose = (): void => {
		setIsOpen(false);
	};

	if (isOpen) {
		return <Chat board={board} onClose={handleClose} />;
	}

	return (
		<>
			<UiPanel className={styles.wrapper} padding={0}>
				<button
					onClick={toggleChat}
					className={styles.panelButton}
					title="Generate AI Chart"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						className={styles.panelIcon}
					>
						<path d="M10 9.5 8 12l2 2.5"></path>
						<path d="m14 9.5 2 2.5-2 2.5"></path>
						<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z"></path>
					</svg>
				</button>
			</UiPanel>

			{/* {isOpen && <Chat board={board} onClose={handleClose} />} */}
		</>
	);
};

export default ChatPanel;
