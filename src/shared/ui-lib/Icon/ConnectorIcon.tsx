import type { ConnectorLineStyle } from "microboard-temp";
import React from "react";
import sprite from "./sprite.svg";

type Props = {
  iconName: ConnectorLineStyle;
  width?: number | string;
  height?: number | string;
  style?: React.CSSProperties;
};

export function ConnectorIcon({
  iconName,
  style,
  height = 20,
  width = 20,
}: Props): React.ReactElement {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      width={width}
      height={height}
      style={style}
    >
      <use width={width} height={height} xlinkHref={`${sprite}#${iconName}`} />
    </svg>
  );
}
