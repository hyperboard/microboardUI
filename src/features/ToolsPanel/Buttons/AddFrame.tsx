import type { FrameType } from "microboard-temp";
import { getHotkeyLabel } from "microboard-temp";
import React from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "features/AppContext";
import { FramePicker } from "features/Pickers/FramePicker";
import { UiPanel } from "shared/ui-lib/UiPanel";
import { ButtonWithMenu } from "./ButtonWithMenu";
import { UiButton } from "shared/ui-lib/UiButton";
import {
  findFrameOption,
  getAddFrameOverlay,
  getFrameOptions,
} from "features/Pickers/FramePicker/frameMetadata";
import { OverlayMetadataIcon } from "features/OverlayUI/OverlayMetadataIcon";

export function AddFrame() {
  const { board } = useAppContext();
  const { t } = useTranslation();
  const overlay = getAddFrameOverlay();
  const options = getFrameOptions();

  const handleClick = () => {
    board.tools.addFrame(true);
  };

  const handlePick = (type: FrameType) => {
    const addFrame = board.tools.getAddFrame();
    if (addFrame) {
      addFrame.setShapeType(type);
      addFrame.addNextTo();
    }
  };

  const isActive = Boolean(board.tools.getAddFrame());
  const selected = board.tools.getAddFrame()?.shape;
  const selectedOption = findFrameOption(selected);
  return (
    <ButtonWithMenu
      isOpen={isActive}
      button={
        <UiButton
          id={"tool-frame"}
          tooltip={isActive ? undefined : t("toolsPanel.addFrame.tooltip")}
          hotkey={getHotkeyLabel("frame")}
          onClick={handleClick}
          active={isActive}
          variant="secondary"
          rounded="none"
        >
          <OverlayMetadataIcon
            icon={selectedOption?.icon ?? overlay?.icon}
            label={selectedOption?.label ?? overlay?.label}
            size={24}
          />
        </UiButton>
      }
    >
      <UiPanel gap={4} grid columns={4}>
        <FramePicker
          options={options}
          onPick={handlePick}
          selected={selected ?? "Custom"}
        />
      </UiPanel>
    </ButtonWithMenu>
  );
}
