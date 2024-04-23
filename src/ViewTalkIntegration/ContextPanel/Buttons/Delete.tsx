import React from "react";
import { UiButton } from "ViewTalkIntegration/Ui/UiButton/UiButton";
import { Icon } from "ViewTalkIntegration/Icon";
import { usePanelContext } from "ViewTalkIntegration/ContextPanel/PanelContext";

export function Delete() {
	const { board } = usePanelContext();
	const handleClick = () => {
		board.selection.removeFromBoard();
	};

	return (
		<UiButton onClick={handleClick}>
			<Icon
				width={15}
				height={18}
				style={{ color: "#DF4E49" }}
				iconName="Trash"
			/>
		</UiButton>
	);
}
