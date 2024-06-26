import React from "react";
import { useAppContext } from "ViewUpdate/AppContext";
import { UiButton } from "ViewUpdate/Ui/UiButton/UiButton";

export function Edit(): React.ReactElement | null {
	const { board } = useAppContext();

	const handleClick = () => {
		board.selection.editSelected();
	};
	return (
		<UiButton id="ContextPanelEdit" onClick={handleClick} title="Edit">
			Edit
		</UiButton>
	);
}
