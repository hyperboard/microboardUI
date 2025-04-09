import { Icon } from "shared/ui-lib/Icon/Icon";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { UiButton } from "shared/ui-lib/UiButton/index";
import style from "./AddMedia.module.css";
import { UiPanel } from "shared/ui-lib/UiPanel/UiPanel";
import { ButtonWithMenu } from "features/ToolsPanel/Buttons/ButtonWithMenu/ButtonWithMenu";
import { AddMediaButton } from "features/ToolsPanel/Buttons/AddMedia/AddMediaButton";
import { useAppContext } from "features/AppContext";
import { useClickOutside } from "shared/lib/useClickOutside";

export function AddMedia(): JSX.Element {
	const { board } = useAppContext();
	const [isOpen, setIsOpen] = useState(false);
	const { t } = useTranslation();
	const containerRef = useClickOutside(
		() => {
			if (isOpen) {
				setIsOpen(false);
			}
		},
		undefined,
		true,
	);

	const toggleIsOpen = () => {
		setIsOpen(!isOpen);
		board.tools.cancel();
	};

	return (
		<div ref={containerRef}>
			<ButtonWithMenu
				button={
					<UiButton
						id={"tool-add-media"}
						tooltip={
							isOpen
								? undefined
								: t("toolsPanel.addMedia.tooltip")
						}
						active={isOpen}
						variant="secondary"
						rounded="bottom"
						onClick={toggleIsOpen}
					>
						<Icon iconName="AddMedia" />
					</UiButton>
				}
				isOpen={isOpen}
			>
				<UiPanel vertical padding={0} className={style.panel}>
					<AddMediaButton
						type="Image"
						rounded="top"
						toggleMenu={toggleIsOpen}
					/>
					<AddMediaButton
						type="Video"
						rounded="none"
						toggleMenu={toggleIsOpen}
					/>
					<AddMediaButton
						type="Audio"
						rounded="bottom"
						toggleMenu={toggleIsOpen}
					/>
				</UiPanel>
			</ButtonWithMenu>
		</div>
	);
}
