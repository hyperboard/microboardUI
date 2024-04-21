import { uploadImage } from "Board/Items/Image/uploadImage";
import React, { ChangeEventHandler, useRef } from "react";
import { Icon } from "ViewTalkIntegration/Icon";
import { usePanelContext } from "ViewTalkIntegration/ToolsPanel/PanelContext";
import { UiButton } from "ViewTalkIntegration/Ui/UiButton";

export function AddImage() {
	const { board } = usePanelContext();
	const inputRef = useRef<HTMLInputElement>(null);

	const handleClick = () => {
		const input = inputRef.current;
		if (!input) {
			return;
		}
		input.click();
	};

	const handleChange: ChangeEventHandler<HTMLInputElement> = e => {
		const input = e.target;
		const file = input.files?.[0];
		if (!file) {
			return;
		}

		uploadImage(file, board);
		input.value = "";
	};

	return (
		<UiButton tooltip="Добавить изображение" onClick={handleClick}>
			<Icon width={20} height={18} iconName="Image" />
			<input
				onChange={handleChange}
				ref={inputRef}
				type="file"
				style={{ display: "none" }}
				accept="image/*,application/pdf"
			/>
		</UiButton>
	);
}
