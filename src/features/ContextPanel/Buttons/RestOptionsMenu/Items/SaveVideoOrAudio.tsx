import { useAppContext } from "features/AppContext";
import { usePanelContext } from "features/ContextPanel/PanelContext";
import { AudioItem, VideoItem } from "microboard-temp";
import React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "shared/ui-lib/Icon";
import { RestOptionsMenuItem } from "../RestOptionsMenuItem";

interface Props {
  itemType: "Audio" | "Video";
}

export function SaveVideoOrAudio({ itemType }: Props): React.JSX.Element {
  const { board } = useAppContext();
  const { toggleMenu } = usePanelContext();
  const { t } = useTranslation();
  const item = board.selection.items.getSingle();
  const selectedItem =
    itemType === "Video"
      ? item instanceof VideoItem && item.getIsStorageUrl()
        ? item
        : null
      : item instanceof AudioItem && item.getExtension()
        ? item
        : null;
  if (!selectedItem) {
    return <></>;
  }

  const onClick = (): void => {
    selectedItem.download();
    toggleMenu("None");
  };

  return (
    <RestOptionsMenuItem
      onClick={onClick}
      icon={
        <Icon
          style={{ color: "#696B76" }}
          iconName="Save"
          width={17}
          height={17}
        />
      }
    >
      {t(`contextPanel.${itemType}.save`)}
    </RestOptionsMenuItem>
  );
}
