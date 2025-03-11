import React, { useEffect, useRef, useState } from "react";
import { ButtonWithMenu } from "features/ContextPanel/Buttons/ButtonWithMenu";
import { Icon } from "shared/ui-lib/Icon";
import { UiPanel } from "shared/ui-lib/UiPanel/UiPanel";
import style from "./Hyperlink.module.css";
import { useAppContext } from "features/AppContext";
import { useTranslation } from "react-i18next";
import { usePanelContext } from "features/ContextPanel/PanelContext";
import btnStyle from "../ContextPanelButton.module.css";
import { UiButton } from "shared/ui-lib/UiButton";

type HyperlinkProps = {
	isReady: boolean;
};

const MENU_NAME = "Hyperlink";
export const Hyperlink = ({
	isReady,
}: HyperlinkProps): React.ReactElement | null => {
	const { toggleMenu, openedMenu, panelMbr, windowHeight } =
		usePanelContext();
	const { board } = useAppContext();
	const { t } = useTranslation();
	const inputRef = useRef<HTMLInputElement | null>(null);
	const [url, setUrl] = useState("");

	const selectionContext = board.selection.getContext();

	const handleClick = (): void => {
		toggleMenu(MENU_NAME);
	};

	useEffect(() => {
		if (
			selectionContext === "EditUnderPointer" &&
			openedMenu === MENU_NAME
		) {
			setTimeout(() => {
				inputRef.current?.focus();
				const selection = board.selection
					.getTextToEdit()[0]
					?.editor.getSelection();
				if (selection) {
					setUrl(JSON.stringify(selection));
				}
			}, 80);
		}
	}, [selectionContext, openedMenu]);

	const handleFocus = (ev: React.FocusEvent<HTMLInputElement>): void => {
		ev.currentTarget.select();
		if (openedMenu !== MENU_NAME) {
			toggleMenu(MENU_NAME);
		}
	};

	const handleInputClick = (ev: React.MouseEvent<HTMLInputElement>): void => {
		ev.stopPropagation();
		if (openedMenu !== MENU_NAME) {
			toggleMenu(MENU_NAME);
		}
		if (selectionContext === "EditTextUnderPointer") {
			board.selection.setContext("EditUnderPointer");
		}
	};

	const handleApplyHyperlink = (): void => {
		const { board } = useAppContext();
		const richTextItems = board.selection.getTextToEdit();

		if (richTextItems.length > 0) {
			const textItem = richTextItems[0];
			const selection = textItem.editor.getSelection();
			if (selection) {
				textItem.editor.applyHyperlink(url, selection);
			}
		}
		setUrl("");
		toggleMenu(MENU_NAME);
	};

	return (
		<>
			{isReady && (
				<ButtonWithMenu
					menuName={MENU_NAME}
					openedMenu={openedMenu}
					panelMbr={panelMbr}
					windowHeight={windowHeight}
					align="left"
					button={
						<UiButton
							className={btnStyle.contextPanelButton}
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
								ref={inputRef}
								onClick={handleInputClick}
								onChange={event => setUrl(event.target.value)}
								onFocus={handleFocus}
								onKeyDown={ev => ev.stopPropagation()}
								onPaste={ev => ev.stopPropagation()}
								className={style.input}
							/>
							<button
								onClick={handleApplyHyperlink}
								className={style.applyButton}
							>
								Apply
							</button>
						</div>
					</UiPanel>
				</ButtonWithMenu>
			)}
		</>
	);
};
