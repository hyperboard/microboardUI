import { uploadImage } from "Board/Items/Image/uploadImage";
import { useAppContext } from "View/AppContext";
import { Icon } from "View/Icon";
import { UiButton } from "View/Ui/UiButton";
import React, { ChangeEventHandler, useRef } from "react";
import { useTranslation } from "react-i18next";

export function AddImage(): JSX.Element {
	const { board } = useAppContext();
	const inputRef = useRef<HTMLInputElement>(null);
	const { t } = useTranslation();

	const handleClick = (): void => {
		const input = inputRef.current;
		if (!input) {
			return;
		}
		board.tools.cancel();
		input.click();
	};

	const handleChange: ChangeEventHandler<HTMLInputElement> = ev => {
		const input = ev.target;
		const file = input.files?.[0];
		if (!file) {
			return;
		}

		uploadImage(file, board);
		input.value = "";
	};

	return (
		<UiButton
			id={"tool-add-image"}
			tooltip={t("toolsPanel.addImage.tooltip")}
			onClick={handleClick}
			rounded="bottom"
			variant="secondary"
		>
			<Icon iconName="Image" />
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
