import { Board } from "Board";
import React from "react";
import { Icon } from "../Icon";
import { UiButton } from "View/Ui/UiButton";

type Props = { board: Board };

export function ExportButton({ board }: Props) {
	const handleClick = () => {
		board.tools.export();
	};
	return (
		<UiButton onClick={handleClick} id="ExportSnapshot">
			<Icon
				name="Export"
				fill="currentColor"
				stroke="none"
				width={24}
				height={24}
			/>
		</UiButton>
	);
}
