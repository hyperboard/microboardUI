import React, { useEffect } from "react";
import { Icon } from "shared/ui-lib/Icon/Icon";
import { useTranslation } from "react-i18next";
import { useHyperLinkContext } from "features/hyperLink/HyperLinkContext";
import { useAppContext } from "features/AppContext";
import { UiButton } from "shared/ui-lib/UiButton";

export const HyperLinkBtn = () => {
  const { t } = useTranslation();
  const { setIsEditingLink, isEditingLink, hyperLinkData, setHyperLinkData } =
    useHyperLinkContext();

  const { board } = useAppContext();

  useEffect(() => {
    if (isEditingLink && hyperLinkData) {
      if (board.selection.getContext() === "EditTextUnderPointer") {
        board.selection.setContext("EditUnderPointer");
      }
    }
  }, [isEditingLink]);

  const toggleIsEditing: React.MouseEventHandler<HTMLButtonElement> = (
    event,
  ) => {
    event.stopPropagation();

    if (!isEditingLink && !hyperLinkData) {
      const selection =
        board.selection.items.getSingle()?.getRichText?.()?.editor?.selection ??
        null;

      setHyperLinkData({
        isWatchMode: false,
        inputPosition: null,
        selection,
      });
    }
    setIsEditingLink(!isEditingLink);
  };

  return (
    <UiButton
      id="Hyperlink"
      tooltip={isEditingLink ? undefined : t("contextPanel.hyperLink.tooltip")}
      onClick={toggleIsEditing}
      variant="secondary"
      tooltipPosition="top"
      rounded="none"
      active={isEditingLink}
    >
      <Icon iconName="HyperlinkIcon" />
    </UiButton>
  );
};
