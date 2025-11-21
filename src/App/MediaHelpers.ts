import { Account } from "entities/account/Account";

export const validateMediaFile = (file: File, account: Account): boolean => {
  const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";
  if (
    !file.type.startsWith("image") &&
    !window.MICROBOARD_CONFIG.AUDIO_FORMATS.includes(fileExtension) &&
    !window.MICROBOARD_CONFIG.VIDEO_FORMATS.includes(fileExtension)
  ) {
    window.MICROBOARD_CONFIG.notify({
      variant: "warning",
      header: window.MICROBOARD_CONFIG.i18n.t(
        "toolsPanel.addMedia.unsupportedFormat.header",
      ),
      body: window.MICROBOARD_CONFIG.i18n.t(
        "toolsPanel.addMedia.unsupportedFormat.body",
      ),
      duration: 4000,
    });
    return false;
  }

  const isBasicPlan = account.billingInfo?.plan.name === "basic";
  let errorBody = window.MICROBOARD_CONFIG.i18n.t(
    `toolsPanel.addMedia.tooLarge.imageBody.${isBasicPlan ? "basic" : "plus"}`,
  );

  if (
    window.MICROBOARD_CONFIG.AUDIO_FORMATS.includes(fileExtension) ||
    window.MICROBOARD_CONFIG.VIDEO_FORMATS.includes(fileExtension)
  ) {
    errorBody = window.MICROBOARD_CONFIG.i18n.t(
      `toolsPanel.addMedia.tooLarge.audioOrVideoBody.${isBasicPlan ? "basic" : "plus"}`,
    );
    if (
      file.size / 1024 ** 2 >
      (account.billingInfo?.storage.maxMediaSize || Infinity)
    ) {
      window.MICROBOARD_CONFIG.notify({
        variant: "warning",
        header: window.MICROBOARD_CONFIG.i18n.t(
          "toolsPanel.addMedia.tooLarge.header",
        ),
        body: errorBody,
        button: isBasicPlan
          ? {
              text: window.MICROBOARD_CONFIG.i18n.t(
                "toolsPanel.addMedia.upgradeToPlus",
              ),
              onClick: () =>
                window.MICROBOARD_CONFIG.openModal("USER_PLAN_MODAL_ID"),
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
    window.MICROBOARD_CONFIG.notify({
      variant: "warning",
      header: window.MICROBOARD_CONFIG.i18n.t(
        "toolsPanel.addMedia.tooLarge.header",
      ),
      body: errorBody,
      button: isBasicPlan
        ? {
            text: window.MICROBOARD_CONFIG.i18n.t(
              "toolsPanel.addMedia.upgradeToPlus",
            ),
            onClick: () =>
              window.MICROBOARD_CONFIG.openModal("USER_PLAN_MODAL_ID"),
          }
        : undefined,
      duration: 4000,
    });
    return false;
  }
  return true;
};

export const catchMediaErrorResponse = async (
  response: Response,
  mediaType: "image" | "video" | "audio",
) => {
  if (response.status === 403) {
    const data = await response.json();
    let errorBody = window.MICROBOARD_CONFIG.i18n.t(
      "toolsPanel.addMedia.limitReached.bodyWithoutLimit",
    );
    if (!data.isOwnerRequest) {
      errorBody = window.MICROBOARD_CONFIG.i18n.t(
        "toolsPanel.addMedia.limitReached.bodyOwner",
      );
    } else if (data.currentUsage && data.storageLimit) {
      errorBody = window.MICROBOARD_CONFIG.i18n.t(
        `toolsPanel.addMedia.limitReached.body.${
          parseInt(data.storageLimit) < 100_000 ? "basic" : "plus"
        }`,
      );
    }
    window.MICROBOARD_CONFIG.notify({
      variant: "warning",
      header: window.MICROBOARD_CONFIG.i18n.t(
        "toolsPanel.addMedia.limitReached.header",
      ),
      body: errorBody,
      button:
        data.isOwnerRequest && data.storageLimit <= 100
          ? {
              text: window.MICROBOARD_CONFIG.i18n.t(
                "toolsPanel.addMedia.upgradeToPlus",
              ),
              onClick: () =>
                window.MICROBOARD_CONFIG.openModal("USER_PLAN_MODAL_ID"),
            }
          : undefined,
      duration: 8000,
    });
  } else if (response.status === 413) {
    const data = await response.json();
    let errorBody = window.MICROBOARD_CONFIG.i18n.t(
      "toolsPanel.addMedia.tooLarge.bodyWithoutLimit",
    );
    let isBasicPlan = false;
    if (data.fileSizeLimit && data.fileSize) {
      if (mediaType === "image") {
        isBasicPlan = parseInt(data.fileSizeLimit) < 20;
        errorBody = window.MICROBOARD_CONFIG.i18n.t(
          `toolsPanel.addMedia.tooLarge.imageBody.${isBasicPlan ? "basic" : "plus"}`,
        );
      } else {
        isBasicPlan = parseInt(data.fileSizeLimit) < 1000;
        errorBody = window.MICROBOARD_CONFIG.i18n.t(
          `toolsPanel.addMedia.tooLarge.audioOrVideoBody.${
            isBasicPlan ? "basic" : "plus"
          }`,
        );
      }
    }
    window.MICROBOARD_CONFIG.notify({
      variant: "warning",
      header: window.MICROBOARD_CONFIG.i18n.t(
        "toolsPanel.addMedia.tooLarge.header",
      ),
      body: errorBody,
      button: isBasicPlan
        ? {
            text: window.MICROBOARD_CONFIG.i18n.t(
              "toolsPanel.addMedia.upgradeToPlus",
            ),
            onClick: () =>
              window.MICROBOARD_CONFIG.openModal("USER_PLAN_MODAL_ID"),
          }
        : undefined,
      duration: 4000,
    });
  } else if (response.status === 401) {
    window.MICROBOARD_CONFIG.openModal("MEDIA_UNAVAILABLE_MODAL_ID");
  } else if (response.status === 415) {
    window.MICROBOARD_CONFIG.notify({
      variant: "warning",
      header: window.MICROBOARD_CONFIG.i18n.t(
        "toolsPanel.addMedia.unsupportedFormat.header",
      ),
      body: window.MICROBOARD_CONFIG.i18n.t(
        "toolsPanel.addMedia.unsupportedFormat.body",
      ),
      duration: 4000,
    });
  } else {
    window.MICROBOARD_CONFIG.notify({
      variant: "error",
      header: window.MICROBOARD_CONFIG.i18n.t(
        "toolsPanel.addMedia.unhandled.header",
      ),
      body: window.MICROBOARD_CONFIG.i18n.t(
        "toolsPanel.addMedia.unhandled.body",
      ),
      duration: 4000,
    });
  }
  throw new Error(`HTTP status: ${response.status}`);
};
