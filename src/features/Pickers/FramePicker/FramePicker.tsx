import type { FrameType } from "microboard-temp";
import { FRAME_TYPES } from "microboard-temp";
import React from "react";
import { FrameIcon } from "shared/ui-lib/Icon";
import style from "./FramePicker.module.css";
import { UiButton } from "shared/ui-lib/UiButton";

type Props = {
  onPick: (type: FrameType) => void;
  selected: FrameType;
  onPointerEnter?: (type: FrameType) => void;
  onPointerLeave?: (type: FrameType) => void;
};

export function FramePicker({
  onPick,
  onPointerEnter,
  onPointerLeave,
  selected,
}: Props): React.ReactElement {
  return (
    <>
      {FRAME_TYPES.map(({ id, label }) => (
        <UiButton
          onClick={() => onPick(id)}
          className={style.button}
          variant="secondary"
          active={id === selected}
          onPointerEnter={() => onPointerEnter && onPointerEnter(id)}
          onPointerLeave={() => onPointerLeave && onPointerLeave(id)}
          key={id}
          id={`frame-picker-${id}`}
        >
          <FrameIcon iconName={id} />
          <span>{label}</span>
        </UiButton>
      ))}
    </>
  );
}
