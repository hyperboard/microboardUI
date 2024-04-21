import { ShapeType } from "Board/Items/Shape/Basic";
import React from "react";
import { usePanelContext } from "ViewTalkIntegration/ContextPanel/PanelContext";
import { Icon } from "ViewTalkIntegration/Icon";
import { ShapePicker } from "ViewTalkIntegration/Pickers/ShapeTypePicker";
import { UiButton } from "ViewTalkIntegration/Ui/UiButton";
import { UiButtonWithMenu } from "ViewTalkIntegration/ContextPanel/Buttons/ButtonWithMenu";
import { UiPanel } from "ViewTalkIntegration/Ui/UiPanel";

const MENU_NAME = "ItemType";

export function ItemType(): React.ReactElement | null {
	const { board, toggleMenu, openedMenu, panelMbr, windowHeight } =
		usePanelContext();

	const handleClick = () => {
		toggleMenu(MENU_NAME);
	};
	const handlePick = (type: ShapeType) => {
		board.selection.setShapeType(type);
		toggleMenu("None");
	};
	return (
		<UiButtonWithMenu
			menuName={MENU_NAME}
			openedMenu={openedMenu}
			panelMbr={panelMbr}
			windowHeight={windowHeight}
			align="left"
			button={
				<UiButton onClick={handleClick}>
					<Icon width={18} height={18} iconName="AddShape" />
				</UiButton>
			}
		>
			<UiPanel grid columns={3}>
				<ShapePicker onPick={handlePick} />
			</UiPanel>
		</UiButtonWithMenu>
	);
}
