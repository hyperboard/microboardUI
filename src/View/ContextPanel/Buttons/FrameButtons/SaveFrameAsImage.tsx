import { Board } from "Board";
import { Frame } from "Board/Items";
import { exportBoardSnapshot } from "Board/Tools/ExportSnapshot/exportBoardSnapshot";
import { Quality } from "Board/Tools/ExportSnapshot/types";
import React from "react";
import { IconSize } from "View/ContextPanel/ContextPanel";
import { Icon } from "View/Icon";
import { UiButton } from "View/Ui/UiButton";
import { canShowFrameSetting } from ".";

export default function SaveFrameAsImage({
	board,
	toggleMenu,
}: {
	board: Board;
	toggleMenu: (menu: string) => void;
}): React.ReactElement | null {
	if (!canShowFrameSetting(board)) {
		return null;
	}

	const handleClick = (): void => {
		toggleMenu("SaveAsImage");
		const frame = board.selection.items.getSingle()! as Frame;
		const frameName = frame.text
			.getText()
			.map(el => {
				if (el.type === "paragraph") {
					return el.children.map(child => {
						if (child.type === "text") {
							return child.text;
						}
						return "";
					});
				}
				return "";
			})
			.join(" ");
		exportBoardSnapshot({
			board,
			bgColor: frame.getBackgroundColor(),
			selection: frame.getMbr(),
			nameToExport: `frame-${frameName}`,
			upscaleTo: 4000,
		});
	};

	return (
		<UiButton
			id="SaveAsImage"
			onClick={handleClick}
			title="Save Frame as image (PNG)"
		>
			<Icon name={"saveAsImage"} width={IconSize} height={IconSize} />
		</UiButton>
	);
}
