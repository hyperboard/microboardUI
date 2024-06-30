import { RichText } from "Board/Items";
import { HorisontalAlignment } from "Board/Items/Alignment";
import { Drawing } from "Board/Items/Drawing";
import { ImageItem } from "Board/Items/Image";
import React from "react";
import { ButtonWithMenu } from "ViewTalkIntegration/ContextPanel/Buttons/ButtonWithMenu";
import { usePanelContext } from "ViewTalkIntegration/ContextPanel/PanelContext";
import { Icon } from "ViewTalkIntegration/Icon";
import { HorizontalAlignmentPicker } from "ViewTalkIntegration/Pickers/HorizontalAlignmentPicker";
import { UiButton } from "ViewTalkIntegration/Ui/UiButton/UiButton";
import { UiPanel } from "ViewTalkIntegration/Ui/UiPanel/UiPanel";
import { useTalkTranslation } from "ViewTalkIntegration/useTalkTranslation";

const MENU_NAME = "TextAlignment";

export function TextAlignment(): React.ReactElement | null {
	const { board, toggleMenu, openedMenu, panelMbr, windowHeight } =
		usePanelContext();
	const [alignment, setAlignment] = React.useState<
		"left" | "center" | "right" | undefined
	>(undefined);
	React.useEffect(() => {
		setAlignment(board.selection.getText()?.getHorisontalAlignment());
	}, [board.selection.getText()?.getHorisontalAlignment()]);

	const { t } = useTalkTranslation();

	const handleClick = () => {
		toggleMenu(MENU_NAME);
	};

	const handlePick = (alignment: HorisontalAlignment) => {
		board.selection.setHorisontalAlignment(alignment);
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
					id="text-alignment"
					tooltip={t("contextPanel.textAlignment.tooltip")}
					tooltipPosition="top"
					onClick={handleClick}
				>
					<Icon
						iconName={`TextAlign${
							alignment === "center"
								? "Center"
								: alignment === "left"
								? "Left"
								: "Right"
						}`}
						width={16}
						height={16}
					/>
				</UiButton>
			}
		>
			<UiPanel>
				<HorizontalAlignmentPicker
					alignment={alignment || "left"}
					onPick={handlePick}
				/>
			</UiPanel>
		</ButtonWithMenu>
	);
}
