import React, { forwardRef, PropsWithChildren, ReactNode } from "react";
import style from "./ButtonWithMenu.module.css";
import clsx from "clsx";

type Props = PropsWithChildren<{
  isOpen: boolean;
  button: ReactNode;
  className?: string;
}>;

export const ButtonWithMenu = forwardRef<HTMLDivElement, Props>(
  ({ button, children, isOpen, className }, ref) => {
    return (
      <div className={clsx(style.container, className && className)} ref={ref}>
        {button}
        {isOpen && <div className={style.menu}>{children}</div>}
      </div>
    );
  },
);
ButtonWithMenu.displayName = "ButtonWithMenu";
