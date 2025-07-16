import clsx from "clsx";
import React, {
  AnchorHTMLAttributes,
  forwardRef,
  type PropsWithChildren,
} from "react";
import style from "./UiLink.module.css";

type UiLinkProps = PropsWithChildren<
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    active?: boolean;
    disabled?: boolean;
    variant?: "default" | "secondary" | "tertiary" | "ghost";
    size?: "lg" | "md" | "sm";
    rounded?:
      | "top"
      | "bottom"
      | "left"
      | "right"
      | "full"
      | "none"
      | "bottom-left"
      | "bottom-right";
    radius?: "xl" | "md" | "sm";
    className?: string;
  }
>;

export const UiLink = forwardRef<HTMLAnchorElement, UiLinkProps>(
  (
    {
      children,
      className,
      variant = "default",
      size = "lg",
      radius = "xl",
      rounded = "full",
      ...props
    },
    ref,
  ) => {
    return (
      <a
        className={clsx(
          style.button,
          style[variant],
          style[size],
          {
            [style.topRounded]: rounded === "top",
            [style.bottomRounded]: rounded === "bottom",
            [style.fullRounded]: rounded === "full",
            [style.leftRounded]: rounded === "left",
            [style.rightRounded]: rounded === "right",
            [style.fullRounded]: rounded === "full",
          },
          {
            [style.radiusXl]: radius === "xl",
            [style.radiusMd]: radius === "md",
            [style.radiusSm]: radius === "sm",
          },
          className,
        )}
        ref={ref}
        {...props}
      >
        {children}
      </a>
    );
  },
);

UiLink.displayName = "UiLink";
