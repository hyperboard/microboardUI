import React from "react";
import { Board } from "Board";
import { Icon } from "View/Icon";
import { UiButton } from "View/Ui/UiButton";
import { canShowFrameSetting } from ".";
import { IconSize } from "View/ContextPanel/ContextPanel";

export default function CopyLinkFrame({
	board,
	toggleMenu,
}: {
	board: Board;
	toggleMenu: (menu: string) => void;
}): React.ReactElement | null {
	if (!canShowFrameSetting(board)) {
		return null;
	}

	const copyFrameLinkToClipboard = async (): Promise<void> => {
		try {
			const { origin, pathname } = window.location;
			const frameId = board.selection.items.getSingle()!.getId();
			await navigator.clipboard.writeText(
				`${origin}${pathname}?focus=${frameId}`,
			);
		} catch (err) {
			console.error("Не удалось скопировать текст: ", err);
		}
	};

	return (
		<UiButton
			id="ShareLink"
			onClick={() => {
				toggleMenu("ShareLink");
				copyFrameLinkToClipboard();
			}}
			title="Copy link to Frame"
		>
			<Icon name={"shareLink"} width={IconSize} height={IconSize} />
		</UiButton>
	);
}
