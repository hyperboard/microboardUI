import { ShapeType } from "Board/Items/Shape/Basic";
import React from "react";
import { ButtonWithMenu } from "ViewTalkIntegration/ContextPanel/Buttons/ButtonWithMenu";
import { usePanelContext } from "ViewTalkIntegration/ContextPanel/PanelContext";
import { Icon } from "ViewTalkIntegration/Icon";
import { ShapePicker } from "ViewTalkIntegration/Pickers/ShapeTypePicker";
import { UiButton } from "ViewTalkIntegration/Ui/UiButton/UiButton";
import { UiPanel } from "ViewTalkIntegration/Ui/UiPanel/UiPanel";
import { useTalkTranslation } from "ViewTalkIntegration/useTalkTranslation";

const MENU_NAME = "ItemType";

export function ItemType(): React.ReactElement | null {
	const { board, toggleMenu, openedMenu, panelMbr, windowHeight } =
		usePanelContext();

	const { t } = useTalkTranslation();

	const handleClick = () => {
		toggleMenu(MENU_NAME);
	};
	const handlePick = (type: ShapeType) => {
		board.selection.setShapeType(type);
		toggleMenu("None");
	};
	return (
		<ButtonWithMenu
			menuName={MENU_NAME}
			openedMenu={openedMenu}
			panelMbr={panelMbr}
			windowHeight={windowHeight}
			align="left"
			button={
				<UiButton
					id="item-type"
					tooltip={t("contextPanel.changeShape.tooltip")}
					tooltipPosition="top"
					onClick={handleClick}
				>
					<Icon width={18} height={18} iconName="AddShape" />
				</UiButton>
			}
		>
			<UiPanel grid columns={3}>
				<ShapePicker onPick={handlePick} />
			</UiPanel>
		</ButtonWithMenu>
	);
}
