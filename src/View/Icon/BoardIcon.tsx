import * as React from "react";

export function BoardIcon({
  width,
  height,
}: {
  width: number;
  height: number;
}): React.ReactElement {
  const scale = (width - 2) / 100;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${height} ${height}`}>
      <g transform={`translate(1,1) scale(${scale})`}>
        <path
          style={{
            fill: "none",
            stroke: "currentColor",
            strokeWidth: "4px",
            strokeLinecap: "butt",
            strokeLinejoin: "miter",
            strokeOpacity: "1",
          }}
          d="M 5,5 H 95"
        />
        <path
          style={{
            fill: "none",
            stroke: "currentColor",
            strokeWidth: "4px",
            strokeLinecap: "butt",
            strokeLinejoin: "miter",
            strokeOpacity: "1",
          }}
          d="M 90,5 V 65 H 10 V 5"
        />
        <path
          style={{
            fill: "none",
            stroke: "currentColor",
            strokeWidth: "4px",
            strokeLinecap: "butt",
            strokeLinejoin: "miter",
            strokeOpacity: "1",
          }}
          d="M 50,65 V 80"
        />
        <path
          style={{
            fill: "none",
            stroke: "currentColor",
            strokeWidth: "4px",
            strokeLinecap: "butt",
            strokeLinejoin: "miter",
            strokeOpacity: "1",
          }}
          d="M 25,95 50,80 75,95"
        />
      </g>
    </svg>
  );
}
