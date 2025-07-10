import { conf } from "microboard-temp";
import { Account } from "entities/account/Account";

export const validateMediaFile = (file: File, account: Account): boolean => {
	const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";
	if (
		!file.type.startsWith("image") &&
		!conf.AUDIO_FORMATS.includes(fileExtension) &&
		!conf.VIDEO_FORMATS.includes(fileExtension)
	) {
		conf.notify({
			variant: "warning",
			header: conf.i18n.t("toolsPanel.addMedia.unsupportedFormat.header"),
			body: conf.i18n.t("toolsPanel.addMedia.unsupportedFormat.body"),
			duration: 4000,
		});
		return false;
	}

	const isBasicPlan = account.billingInfo?.plan.name === "basic";
	let errorBody = conf.i18n.t(
		`toolsPanel.addMedia.tooLarge.imageBody.${isBasicPlan ? "basic" : "plus"}`,
	);

	if (
		conf.AUDIO_FORMATS.includes(fileExtension) ||
		conf.VIDEO_FORMATS.includes(fileExtension)
	) {
		errorBody = conf.i18n.t(
			`toolsPanel.addMedia.tooLarge.audioOrVideoBody.${isBasicPlan ? "basic" : "plus"}`,
		);
		if (
			file.size / 1024 ** 2 >
			(account.billingInfo?.storage.maxMediaSize || Infinity)
		) {
			conf.notify({
				variant: "warning",
				header: conf.i18n.t("toolsPanel.addMedia.tooLarge.header"),
				body: errorBody,
				button: isBasicPlan
					? {
							text: conf.i18n.t(
								"toolsPanel.addMedia.upgradeToPlus",
							),
							onClick: () => conf.openModal("USER_PLAN_MODAL_ID"),
						}
					: undefined,
				duration: 4000,
			});
			return false;
		}
	} else if (
		file.size / 1024 ** 2 >
		(account.billingInfo?.storage.maxImageSize || Infinity)
	) {
		conf.notify({
			variant: "warning",
			header: conf.i18n.t("toolsPanel.addMedia.tooLarge.header"),
			body: errorBody,
			button: isBasicPlan
				? {
						text: conf.i18n.t("toolsPanel.addMedia.upgradeToPlus"),
						onClick: () => conf.openModal("USER_PLAN_MODAL_ID"),
					}
				: undefined,
			duration: 4000,
		});
		return false;
	}
	return true;
};

export const catchDuplicateErrorResponse = async (response: Response) => {
	if (response.status === 403) {
		conf.notify({
			variant: "warning",
			header: conf.i18n.t("toolsPanel.addMedia.limitReached.header"),
			body: conf.i18n.t("toolsPanel.addMedia.limitReached.duplicateBody"),
			duration: 4000,
		});
	} else {
		conf.notify({
			variant: "error",
			header: conf.i18n.t("toolsPanel.addMedia.unhandled.header"),
			body: conf.i18n.t("toolsPanel.addMedia.unhandled.body"),
			duration: 4000,
		});
	}
	throw new Error(`HTTP status: ${response.status}`);
};

export const catchMediaErrorResponse = async (
	response: Response,
	mediaType: "image" | "video" | "audio",
) => {
	if (response.status === 403) {
		const data = await response.json();
		let errorBody = conf.i18n.t(
			"toolsPanel.addMedia.limitReached.bodyWithoutLimit",
		);
		if (!data.isOwnerRequest) {
			errorBody = conf.i18n.t(
				"toolsPanel.addMedia.limitReached.bodyOwner",
			);
		} else if (data.currentUsage && data.storageLimit) {
			errorBody = conf.i18n.t(
				`toolsPanel.addMedia.limitReached.body.${
					parseInt(data.storageLimit) < 100_000 ? "basic" : "plus"
				}`,
			);
		}
		conf.notify({
			variant: "warning",
			header: conf.i18n.t("toolsPanel.addMedia.limitReached.header"),
			body: errorBody,
			button:
				data.isOwnerRequest && data.storageLimit <= 100
					? {
							text: conf.i18n.t(
								"toolsPanel.addMedia.upgradeToPlus",
							),
							onClick: () => conf.openModal("USER_PLAN_MODAL_ID"),
						}
					: undefined,
			duration: 8000,
		});
	} else if (response.status === 413) {
		const data = await response.json();
		let errorBody = conf.i18n.t(
			"toolsPanel.addMedia.tooLarge.bodyWithoutLimit",
		);
		let isBasicPlan = false;
		if (data.fileSizeLimit && data.fileSize) {
			if (mediaType === "image") {
				isBasicPlan = parseInt(data.fileSizeLimit) < 20;
				errorBody = conf.i18n.t(
					`toolsPanel.addMedia.tooLarge.imageBody.${isBasicPlan ? "basic" : "plus"}`,
				);
			} else {
				isBasicPlan = parseInt(data.fileSizeLimit) < 1000;
				errorBody = conf.i18n.t(
					`toolsPanel.addMedia.tooLarge.audioOrVideoBody.${
						isBasicPlan ? "basic" : "plus"
					}`,
				);
			}
		}
		conf.notify({
			variant: "warning",
			header: conf.i18n.t("toolsPanel.addMedia.tooLarge.header"),
			body: errorBody,
			button: isBasicPlan
				? {
						text: conf.i18n.t("toolsPanel.addMedia.upgradeToPlus"),
						onClick: () => conf.openModal("USER_PLAN_MODAL_ID"),
					}
				: undefined,
			duration: 4000,
		});
	} else if (response.status === 401) {
		conf.openModal("MEDIA_UNAVAILABLE_MODAL_ID");
	} else if (response.status === 415) {
		conf.notify({
			variant: "warning",
			header: conf.i18n.t("toolsPanel.addMedia.unsupportedFormat.header"),
			body: conf.i18n.t("toolsPanel.addMedia.unsupportedFormat.body"),
			duration: 4000,
		});
	} else {
		conf.notify({
			variant: "error",
			header: conf.i18n.t("toolsPanel.addMedia.unhandled.header"),
			body: conf.i18n.t("toolsPanel.addMedia.unhandled.body"),
			duration: 4000,
		});
	}
	throw new Error(`HTTP status: ${response.status}`);
};

export const beforeMediaRemove = async (
	mediaIds: string[],
	boardId: string,
): Promise<void> => {
	fetch(`${window?.location.origin}/api/v1/media/usage/${boardId}`, {
		method: "POST",
		headers: {
			"content-type": "application/json",
		},
		body: JSON.stringify({ mediaIds, shouldIncrease: false }),
	}).catch(error => {
		console.error("Media storage error:", error);
	});
};

export const beforeMediaUpload = async (
	mediaIds: string[],
	boardId: string,
): Promise<boolean> => {
	try {
		const response = await fetch(
			`${window?.location.origin}/api/v1/media/usage/${boardId}`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ mediaIds, shouldIncrease: true }),
			},
		);

		if (response.status !== 200) {
			await catchDuplicateErrorResponse(response);
			return false;
		}

		return true;
	} catch (error) {
		console.error("Media storage error:", error);
		return false;
	}
};
