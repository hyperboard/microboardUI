import { useAppContext } from "features/AppContext";
import React, { ChangeEventHandler, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "shared/ui-lib/Icon";
import { UiButton } from "shared/ui-lib/UiButton/UiButton";
import btnStyle from "../../ContextPanelButton.module.css";
import { Screen } from "microboard-temp";
import { useAccount } from "App/useAccount";
import { validateMediaFile } from "App/MediaHelpers";
import { uploadImages } from "shared/api/media";

interface Props {
  rounded?: string;
}

export function SetBackgroundImage({ rounded = "none" }: Props) {
  const { board } = useAppContext();
  const account = useAccount();
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  const single = board.selection.items.getSingle();
  if (!single || !(single instanceof Screen)) {
    return null;
  }

  const handleClick = (): void => {
    const input = inputRef.current;
    if (!input) {
      return;
    }
    input.click();
  };

  const handleChange: ChangeEventHandler<HTMLInputElement> = async (ev) => {
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

    uploadImages([file], board.getBoardId(), account.accessToken)
      .then((url) => single.setBackgroundUrl(url[0]))
      .finally(() => (input.value = ""));
  };

  return (
    <>
      <UiButton
        className={btnStyle.contextPanelButton}
        id="set-background-image"
        tooltip={t("contextPanel.gameItems.screen.setBackgroundImage")}
        tooltipPosition="top"
        onClick={handleClick}
        variant="secondary"
        rounded={rounded}
      >
        <Icon iconName="Image" />
      </UiButton>
      <input
        multiple={false}
        onChange={handleChange}
        ref={inputRef}
        type="file"
        style={{ display: "none" }}
        accept="image/*"
      />
    </>
  );
}
