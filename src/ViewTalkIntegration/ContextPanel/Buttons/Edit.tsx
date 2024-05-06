import React from "react";
import { usePanelContext } from "ViewTalkIntegration/ContextPanel/PanelContext";
import { UiButton } from "ViewTalkIntegration/Ui/UiButton/UiButton";

export function Edit(): React.ReactElement | null {
	const { board } = usePanelContext();

	const handleClick = () => {
		board.selection.editSelected();
	};
	return (
		<UiButton id="ContextPanelEdit" onClick={handleClick} title="Edit">
			Edit
		</UiButton>
	);
}
