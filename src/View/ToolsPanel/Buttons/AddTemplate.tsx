import { getHotkeyLabel } from "Board/Keyboard";
import { useAppContext } from "View/AppContext";
import { Icon } from "View/Icon";
import { ColorPicker } from "View/Pickers/ColorPicker/ColorPicker";
import { STICKER_COLORS } from "View/Tools/AddSticker";
import { UiButton } from "View/Ui/UiButton";
import { UiPanel } from "View/Ui/UiPanel/UiPanel";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ButtonWithMenu } from "./ButtonWithMenu";
import { getApiUrl } from "../../../Config";
import Cookies from "js-cookie";
import { BoardEvent } from "../../../Board/Events/Events";

export function AddTemplate() {
	const { board } = useAppContext();
	const { t } = useTranslation();
	const [isActive, setIsActive] = useState(
		Boolean(board.tools.getAddConnector()),
	);

	const addTool = board.tools.getAddSticker();
	useEffect(() => {
		if (addTool) {
			setIsActive(true);
		} else {
			setIsActive(false);
		}
	}, [addTool]);

	const handleClick = async () => {
		const boards = await getUserBoards();
		if (boards) {
			const events = await getBoardEvents(boards[1].boardId);
			if (board.events && events) {
				console.log(events);
				events.forEach(event => {
					event.order += 2000;
					board.events.d;
					board.events!.addEvent(event);
				});
			}
		}
		setIsActive(false);
	};

	async function getUserBoards() {
		try {
			const response = await fetch(`${getApiUrl()}/boards`, {
				method: "GET",
				mode: "cors",
				cache: "no-cache",
				credentials: "same-origin",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${Cookies.get("accessToken")}`,
				},
				redirect: "follow",
				referrerPolicy: "no-referrer",
			});
			if (!response.ok) {
				throw new Error("response not OK");
			}
			const data = await response.json();
			return data.author as { boardId: string; link: string }[];
		} catch (error) {
			console.error("Failed to get boards.", error);
		}
	}

	async function getBoardEvents(boardId: string) {
		try {
			const response = await fetch(
				`${getApiUrl()}/boards/${boardId}/events`,
				{
					method: "GET",
					mode: "cors",
					cache: "no-cache",
					credentials: "same-origin",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${Cookies.get("accessToken")}`,
					},
					redirect: "follow",
					referrerPolicy: "no-referrer",
				},
			);
			if (!response.ok) {
				throw new Error("response not OK");
			}
			const data = await response.json();
			return data as BoardEvent[];
		} catch (error) {
			console.error("Failed to get board events.", error);
		}
	}

	const handlePick = (color: string) => {
		const tool = board.tools.getAddSticker();
		if (tool) {
			tool.setBackgroundColor(color);
			setIsActive(false);
		}
	};

	return (
		<ButtonWithMenu
			button={
				<UiButton
					id={"tool-add-template"}
					tooltip={t("toolsPanel.addTemplate.tooltip")}
					hotkey={getHotkeyLabel("template")}
					active={isActive || !!addTool}
					onClick={handleClick}
					variant="secondary"
					rounded="none"
				>
					<Icon iconName="Sticker" />
				</UiButton>
			}
			isOpen={isActive}
		></ButtonWithMenu>
	);
}
