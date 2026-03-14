import clsx from "clsx";
import React from "react";
import styles from "./SquareColorItem.module.css";
import { Tooltip } from "shared/ui-lib/Tooltip/Tooltip";

type Props = {
  color: string;
  selected: boolean;
  onPick: (color: string) => void;
  id?: string;
  tooltip?: string;
};

export function SquareColorItem({
  color,
  selected,
  onPick,
  id,
  tooltip,
}: Props): React.ReactElement {
  return (
    <button
      onClick={() => onPick(color)}
      id={id}
      className={clsx(selected && styles.active, styles.button)}
    >
      <span style={{ backgroundColor: color }} />
      {tooltip && <Tooltip tooltip={tooltip} tooltipPosition="bottom" />}
    </button>
  );
}
