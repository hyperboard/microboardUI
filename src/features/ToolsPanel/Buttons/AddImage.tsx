import { useAccount } from "App/useAccount";
import { uploadImage } from "Board/Items/Image/uploadImage";
import { useAppContext } from "features/AppContext";
import { Icon } from "shared/ui-lib/Icon";
import { notify } from "shared/ui-lib/Toast";
import React, { ChangeEventHandler, useRef } from "react";
import { useTranslation } from "react-i18next";
import { UiButton } from "shared/ui-lib/UiButton";
import { uploadVideo } from "Board/Items/Video/uploadVideo";

function bytesToGigabytes(bytes: number): number {
	return bytes / 1024 ** 3;
}

function bytesToMegabytes(bytes: number): number {
	return bytes / 1024 ** 2;
}

export function AddImage(): JSX.Element {
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
				body: `На вашем тарифе доступно ${account.billingInfo.plan.name === "basic" ? `${bytesToMegabytes(account.billingInfo.storage.limit)} МБ` : `${bytesToMegabytes(account.billingInfo.storage.limit)} ГБ`} для хранения картинок. Пополните баланс, чтобы продолжить работу`,
				duration: 10000,
			});
		}
		const fileExtension = file.name.split(".").pop()?.toLowerCase();
		if (fileExtension === "mp4" || fileExtension === "webm") {
			uploadVideo(file, board, notify);
		} else {
			uploadImage(file, board);
		}
		input.value = "";
	};

	const accept = window.enableVideos
		? "image/*,application/pdf,video/mp4,video/webm"
		: "image/*,application/pdf";

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
				accept={accept}
			/>
		</UiButton>
	);
}
