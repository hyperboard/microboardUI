import { Group } from "microboard-temp";
import { useAppContext } from "features/AppContext";
import { Icon } from "shared/ui-lib/Icon";
import React from "react";
import { useTranslation } from "react-i18next";
import btnStyle from "./ContextPanelButton.module.css";
import { UiButton } from "shared/ui-lib/UiButton";

type Props = {
	rounded?: "none" | "left";
};

export const Lock = ({
	rounded = "none",
}: Props): React.ReactElement | null => {
	const { t } = useTranslation();
	const { board } = useAppContext();
	const selectedItems = board.selection.list();
	let isLocked = false;

	if (selectedItems.length > 1) {
		isLocked = !selectedItems.some(item => !item.transformation.isLocked);
	} else if (selectedItems.length === 1) {
		isLocked = selectedItems[0].transformation.isLocked;
	}

	const handleClick = (): void => {
		if (
			selectedItems.length > 1 ||
			(selectedItems.length === 1 && selectedItems[0] instanceof Group)
		) {
			const isLocked = selectedItems.every(
				item => item.transformation.isLocked,
			);

			if (!isLocked) {
				const lockedIds = selectedItems.map(item => item.getId());
				const group = board.addLockedGroup(
					new Group(board, undefined, lockedIds, undefined),
				);
				group.setBoard(board);

				board.tools.getSelect()?.nestingHighlighter.clear();
				if (
					board.selection.items.getSingle()?.itemType !== "Connector"
				) {
					board.selection.setContext("None");
				}
				return;
			}

			const groupId = selectedItems[0].getId();
			const group = board.items.getById(groupId);

			if (!(group instanceof Group)) {
				return;
			}

			board.removeLockedGroup(group);
			return;
		}

		const item = selectedItems[0];
		const isLocked = item.transformation.isLocked;
		item.transformation.setIsLocked(!isLocked);

		if (isLocked) {
			board.tools.getSelect()?.nestingHighlighter.clear();
			if (board.selection.items.getSingle()?.itemType !== "Connector") {
				board.selection.setContext("None");
			}
		}
	};

	const tooltip = isLocked
		? t("contextPanel.unlock.tooltip")
		: t("contextPanel.lock.tooltip");

	const icon = isLocked ? (
		<Icon iconName="lock" />
	) : (
		<Icon iconName="unlock" />
	);

	return (
		<UiButton
			className={btnStyle.contextPanelButton}
			id={"lock"}
			onClick={handleClick}
			variant="secondary"
			rounded={rounded}
			tooltip={tooltip}
			tooltipPosition="top"
		>
			{icon}
		</UiButton>
	);
};
