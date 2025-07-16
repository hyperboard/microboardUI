import React from "react";
import styles from "./UiLoader.module.css";

type Props = {
  size?: number;
  rotateTime?: number;
  strokeWidth?: number;
  color?: string;
};

export function UiLoader({
  size,
  rotateTime = 2,
  strokeWidth = 5,
  color = "rgba(10, 15, 41, 0.25)",
}: Props): JSX.Element {
  return (
    <span
      style={
        {
          width: size,
          height: size,
          "--color": color,
          "--stroke-width": `${strokeWidth}px`,
          "--rotate-time": `${rotateTime}s`,
        } as React.CSSProperties
      }
      className={styles.loader}
    />
  );
}
