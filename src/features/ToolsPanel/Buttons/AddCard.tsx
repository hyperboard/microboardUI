import { useAccount } from "App/useAccount";
import { useAppContext } from "features/AppContext";
import { Icon } from "shared/ui-lib/Icon/Icon";
import { notify } from "shared/ui-lib/Toast/index";
import React, { ChangeEventHandler, useRef } from "react";
import { useTranslation } from "react-i18next";
import { UiButton } from "shared/ui-lib/UiButton/index";
import {
	calculatePosition,
	conf,
	ImageItem,
	prepareImage,
} from "microboard-temp";
import { mediaApi } from "shared/api";
import { validateMediaFile } from "App/MediaHelpers";
import { useUiModalContext } from "shared/ui-lib/UiModal/UiModalContext";
import { CREATE_CARDS_MODAL } from "features/CardGame/CreateCardsModal";

interface Props {
	rounded?: "top" | "bottom" | "none";
}

export function AddCard({ rounded = "none" }: Props): JSX.Element {
	const { board } = useAppContext();
	const account = useAccount();
	const inputRef = useRef<HTMLInputElement>(null);
	const { t } = useTranslation();
	const { openModal } = useUiModalContext();

	const handleClick = (): void => {
		openModal(CREATE_CARDS_MODAL);
	};

	// const handleClick = (): void => {
	// 	const input = inputRef.current;
	// 	if (!input) {
	// 		return;
	// 	}
	// 	board.tools.cancel();
	// 	input.click();
	// };
	//
	// const handleChange: ChangeEventHandler<HTMLInputElement> = async ev => {
	// 	const input = ev.target;
	// 	const file = input.files?.[0];
	// 	if (!file) {
	// 		return;
	// 	}
	//
	// 	if (!validateMediaFile(file, account)) {
	// 		if (inputRef.current) {
	// 			inputRef.current.value = "";
	// 		}
	// 		return;
	// 	}
	//
	// 	const reader = new FileReader();
	// 	reader.onload = (event: ProgressEvent<FileReader>) => {
	// 		const base64String = event.target?.result as string;
	// 		prepareImage(base64String, account.accessToken, board.getBoardId())
	// 			.then(imageData => {
	// 				const image = new ImageItem(
	// 					imageData,
	// 					board,
	// 					board.events,
	// 					"",
	// 				);
	// 				image.doOnceBeforeOnLoad(() => {
	// 					const { scaleX, scaleY, translateX, translateY } =
	// 						calculatePosition(image, board);
	// 					image.transformation.applyTranslateTo(
	// 						translateX,
	// 						translateY,
	// 					);
	// 					image.transformation.applyScaleTo(scaleX, scaleY);
	// 					image.updateMbr();
	// 					const boardImage = board.add(image);
	// 					board.selection.removeAll();
	// 					board.selection.add(boardImage);
	// 				});
	// 			})
	// 			.catch(er => {
	// 				console.error("Could not create image:", er);
	// 				// TODO notification
	// 			});
	// 	}
	//
	// 	input.value = "";
	// };

	return (
		<UiButton
			id={`tool-add-card`}
			tooltip="Add Card"
			onClick={handleClick}
			rounded={rounded}
			variant="secondary"
		>
			<Icon iconName="BoxedPlus" width={20} height={20} />
		</UiButton>
	);
}
