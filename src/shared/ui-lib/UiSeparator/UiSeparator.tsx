import clsx from "clsx";
import React from "react";
import style from "./UiSeparator.module.css";

type Props = {
  vertical?: boolean;
  className?: string;
  color?: string;
};

export function UiSeparator({
  vertical = false,
  className,
  color,
}: Props): JSX.Element {
  return (
    <div
      className={clsx(
        style.container,
        vertical ? style.vertical : style.horizontal,
        className,
      )}
    >
      <div
        style={{ color }}
        className={clsx([
          style.separator,
          vertical ? style.vertical : style.horizontal,
        ])}
      />
    </div>
  );
}
