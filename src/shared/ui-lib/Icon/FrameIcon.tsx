import type { FrameType } from "microboard-temp";
import React from "react";

type Props = {
  iconName: FrameType;
  width?: number | string;
  height?: number | string;
  style?: React.CSSProperties;
};

export function FrameIcon({
  iconName,
  style,
  height = 24,
  width = 24,
}: Props): React.ReactElement {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      width={width}
      height={height}
      style={style}
    >
      <use width={width} height={height} xlinkHref={`#${"Frame" + iconName}`} />
    </svg>
  );
}
