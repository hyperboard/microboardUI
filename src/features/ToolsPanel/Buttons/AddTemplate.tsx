import { Icon } from "shared/ui-lib/Icon";
import { UiButton } from "shared/ui-lib/UiButton";
import React from "react";
import { useTranslation } from "react-i18next";
import { useUiModalContext } from "shared/ui-lib/UiModal";
import { SELECT_TEMPLATE_MODAL } from "features/Templates/SelectTemplateModal/SelectTemplateModal";

export function AddTemplate() {
  const { openModal } = useUiModalContext();
  const { t } = useTranslation();

  const handleClick = async (event) => {
    event.stopPropagation();
    openModal(SELECT_TEMPLATE_MODAL);
  };

  return (
    <UiButton
      id={"tool-add-template"}
      tooltip={t("toolsPanel.addTemplate.tooltip")}
      onClick={handleClick}
      variant="secondary"
      rounded="top"
    >
      <Icon iconName="Template" />
    </UiButton>
  );
}
