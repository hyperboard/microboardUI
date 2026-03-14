import React from "react";

import clsx from "clsx";
import style from "./ColorItem.module.css";
import { Tooltip } from "shared/ui-lib/Tooltip/Tooltip";

type Props = {
  color: string;
  active?: boolean;
  id?: string;
  tooltip?: string;
  onPick: (color: string) => void;
};

export function ColorItem({
  color,
  active,
  onPick,
  id,
  tooltip,
}: Props): React.ReactElement {
  return (
    <button
      onClick={() => onPick(color)}
      id={id}
      style={{
        backgroundColor: color === "none" ? "transparent" : color,
      }}
      className={clsx(
        style.button,
        active && style.active,
        color === "none" && style.none,
      )}
    >
      {tooltip && <Tooltip tooltip={tooltip} tooltipPosition="bottom" />}
    </button>
  );
}
