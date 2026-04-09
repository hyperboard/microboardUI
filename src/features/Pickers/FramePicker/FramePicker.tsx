import type { FrameType, OverlayOptionDefinition } from "microboard-temp";
import React from "react";
import { OverlayMetadataIcon } from "features/OverlayUI/OverlayMetadataIcon";
import { getFrameOptions } from "./frameMetadata";
import style from "./FramePicker.module.css";
import { UiButton } from "shared/ui-lib/UiButton";

type Props = {
  options?: OverlayOptionDefinition[];
  onPick: (type: FrameType) => void;
  selected: FrameType;
  onPointerEnter?: (type: FrameType) => void;
  onPointerLeave?: (type: FrameType) => void;
};

export function FramePicker({
  options,
  onPick,
  onPointerEnter,
  onPointerLeave,
  selected,
}: Props): React.ReactElement {
  const resolvedOptions = options ?? getFrameOptions();

  return (
    <>
      {resolvedOptions.map(({ id, label, icon, value }) => (
        <UiButton
          onClick={() => onPick(value as FrameType)}
          className={style.button}
          variant="secondary"
          active={value === selected}
          onPointerEnter={() =>
            onPointerEnter && onPointerEnter(value as FrameType)
          }
          onPointerLeave={() =>
            onPointerLeave && onPointerLeave(value as FrameType)
          }
          key={id}
          id={`frame-picker-${id}`}
        >
          <OverlayMetadataIcon icon={icon} label={label} size={24} />
          <span>{label}</span>
        </UiButton>
      ))}
    </>
  );
}
