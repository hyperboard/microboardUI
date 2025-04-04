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
import { conf } from "Board/Settings";

function bytesToGigabytes(bytes: number): number {
	return bytes / 1024 ** 3;
}

function bytesToMegabytes(bytes: number): number {
	return bytes / 1024 ** 2;
}

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

		await account.fetchBillingInfo();
		if (
			account.billingInfo?.storage?.used !== undefined &&
			account.billingInfo?.storage?.limit !== undefined &&
			account.billingInfo.storage.used >=
				account.billingInfo.storage.limit
		) {
			notify({
				variant: "warning",
				header: "Закончилось место для картинок",
				body: `На вашем тарифе доступно ${account.billingInfo.plan.name === "basic" ? `${account.billingInfo.storage.limit} МБ` : `${account.billingInfo.storage.limit / 1024} ГБ`} для хранения картинок. Пополните баланс, чтобы продолжить работу`,
				duration: 10000,
			});
		}

		const fileExtension = file.name.split(".").pop()?.toLowerCase();

		switch (type) {
			case "Video":
				if (fileExtension !== "mp4" && fileExtension !== "webm") {
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
		accept = conf.VIDEO_FORMATS.map(ext => "video/" + ext).join(",");
	}

	if (type === "Audio") {
		accept = conf.AUDIO_FORMATS.map(ext => "audio/" + ext).join(",");
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
