import { Board } from "Board";
import { uploadImage } from "Board/Items/Image/uploadImage";
import React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "View/Icon";
import { UiButton } from "View/Ui/UiButton/UiButton";

type Props = {
	board: Board;
};

export function AddImage({ board }: Props) {
	const { t } = useTranslation();
	const inputRef = React.useRef<HTMLInputElement>(null);

	const handleClick = () => {
		const input = inputRef.current;
		if (!input) {
			return;
		}
		input.click();
	};

	const handleChange: React.ChangeEventHandler<HTMLInputElement> = e => {
		const input = e.target;
		const file = input.files?.[0];
		if (!file) {
			return;
		}

		uploadImage(file, board);
		input.value = "";
	};

	return (
		<UiButton
			id="AddImage"
			title={t("toolsPanel.addImage.tooltip")}
			onClick={handleClick}
			tipOnLeft
		>
			<Icon name="Image" width={24} height={24} />
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
