import React, { useState } from "react";
import { ButtonWithMenu } from "View/ContextPanel/Buttons/ButtonWithMenu";
import { Icon } from "View/Icon";
import { UiButton } from "View/Ui/UiButton/UiButton";
import { UiPanel } from "View/Ui/UiPanel/UiPanel";
import style from "./Hyperlink.module.css";
import { useAppContext } from "View/AppContext";
import { useTranslation } from "react-i18next";
import { usePanelContext } from "View/ContextPanel/PanelContext";

const MENU_NAME = "Hyperlink";
export const Hyperlink = (): React.ReactElement | null => {
	const { toggleMenu, openedMenu, panelMbr, windowHeight } =
		usePanelContext();
	const { board } = useAppContext();
	const { t } = useTranslation();

	const [url, setUrl] = useState("");
	const selectedText = board.selection.getText();

	const handleClick = () => {
		toggleMenu(MENU_NAME);
	};

	const handleApplyLink = () => {
		if (selectedText && url) {
			const linkedText = `<a href="${url}" target="_blank">${selectedText}</a>`;
			board.selection.setText(linkedText);
			setUrl("");
			toggleMenu("None");
		}
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
					id="Hyperlink"
					tooltip={t("contextPanel.hyperLink.tooltip")}
					tooltipPosition="top"
					onClick={handleClick}
					variant="secondary"
					active={openedMenu === MENU_NAME}
					rounded="none"
				>
					<Icon iconName={`Hyperlink`} />
				</UiButton>
			}
		>
			<UiPanel rounded="full" vertical padding={12} gap={8}>
				<div
					className={style.section}
					style={{ display: "flex", alignItems: "center" }}
				>
					<input
						type="text"
						placeholder="Paste a link"
						value={url}
						onChange={e => setUrl(e.target.value)}
						className={style.input}
					/>
					<button
						onClick={handleApplyLink}
						className={style.applyButton}
					>
						Apply
					</button>
				</div>
			</UiPanel>
		</ButtonWithMenu>
	);
};
