import { useAccount } from "App/useAccount";
import { uploadImage } from "Board/Items/Image/uploadImage";
import { useAppContext } from "features/AppContext";
import { Icon } from "shared/ui-lib/Icon/Icon";
import { notify } from "shared/ui-lib/Toast/index";
import React, { ChangeEventHandler, useRef } from "react";
import { useTranslation } from "react-i18next";
import { UiButton } from "shared/ui-lib/UiButton/index";
import { uploadVideo } from "Board/Items/Video/uploadVideo";
import { uploadAudio } from "Board/Items/Audio/uploadAudio";
import { conf } from "microboard-temp";
import { validateMediaFile } from "Board/Items/Image/ImageHelpers";

function bytesToGigabytes(bytes: number): number {
	return bytes / 1024 ** 3;
}

function bytesToMegabytes(bytes: number): number {
	return bytes / 1024 ** 2;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024;

interface Props {
	type: "Video" | "Audio" | "Image";
	toggleMenu: () => void;
	rounded?: "top" | "bottom" | "none";
}

export function AddMediaButton({
	type,
	rounded = "none",
	toggleMenu,
}: Props): JSX.Element {
	const { board } = useAppContext();
	const account = useAccount();
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

	const notifyAboutUnsupportedFormat = () => {
		if (inputRef.current) {
			inputRef.current.value = "";
		}
		notify({
			variant: "warning",
			header: t("toolsPanel.addMedia.unsupportedFormat.header"),
			body: t("toolsPanel.addMedia.unsupportedFormat.body"),
			duration: 4000,
		});
	};

	const handleChange: ChangeEventHandler<HTMLInputElement> = async ev => {
		const input = ev.target;
		const file = input.files?.[0];
		if (!file) {
			return;
		}

		if (!validateMediaFile(file, account)) {
			if (inputRef.current) {
				inputRef.current.value = "";
			}
			return;
		}

		// if (!(await account.checkMediaStorageSpace())) {
		// 	openModal(USER_PLAN_MODAL_ID)
		// }

		const fileExtension = file.name.split(".").pop()?.toLowerCase();

		switch (type) {
			case "Video":
				if (
					!fileExtension ||
					!conf.VIDEO_FORMATS.includes(fileExtension)
				) {
					return notifyAboutUnsupportedFormat();
				}
				uploadVideo(
					file,
					board,
					notify,
					fileExtension,
					account.accessToken,
				);
				break;
			case "Audio":
				if (
					!fileExtension ||
					!conf.AUDIO_FORMATS.includes(fileExtension)
				) {
					return notifyAboutUnsupportedFormat();
				}
				uploadAudio(
					file,
					board,
					notify,
					fileExtension,
					account.accessToken,
				);
				break;
			default:
				uploadImage(file, board, account.accessToken);
		}

		input.value = "";
		toggleMenu();
	};

	let accept = "image/*,application/pdf";

	if (type === "Video") {
		accept = conf.VIDEO_MIME_TYPES.join(",");
	}

	if (type === "Audio") {
		accept = conf.AUDIO_MIME_TYPES.join(",");
	}

	return (
		<UiButton
			id={`tool-add-${type}`}
			tooltip={t(`toolsPanel.addMedia.${type}`)}
			onClick={handleClick}
			rounded={rounded}
			variant="secondary"
		>
			<Icon iconName={type} width={20} height={20} />
			<input
				onChange={handleChange}
				ref={inputRef}
				type="file"
				style={{ display: "none" }}
				accept={accept}
			/>
		</UiButton>
	);
}
