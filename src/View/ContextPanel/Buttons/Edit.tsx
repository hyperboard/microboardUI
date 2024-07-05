import React from "react";
import { useAppContext } from "View/AppContext";
import { UiButton } from "View/Ui/UiButton/UiButton";

export function Edit(): React.ReactElement | null {
	const { board } = useAppContext();

	const handleClick = () => {
		board.selection.editSelected();
	};
	return (
		<UiButton
			id="ContextPanelEdit"
			onClick={handleClick}
			rounded="left"
			variant="secondary"
		>
			Edit
		</UiButton>
	);
}
