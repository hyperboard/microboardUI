import React from "react";
import { useAppContext } from "View/AppContext";
import { UiButton } from "View/Ui/UiButton/UiButton";
import btnStyle from "./ContextPanelButton.module.css";

export function Edit(): React.ReactElement | null {
	const { board } = useAppContext();

	const handleClick = (): void => {
		board.selection.editSelected();
	};
	return (
		<UiButton
			className={btnStyle.contextPanelButton}
			id="ContextPanelEdit"
			onClick={handleClick}
			rounded="left"
			variant="secondary"
		>
			Edit
		</UiButton>
	);
}
