import clsx from "clsx";
import React, {
  ButtonHTMLAttributes,
  CSSProperties,
  forwardRef,
  ReactNode,
} from "react";
import style from "./UiButton.module.css";
import { Tooltip } from "shared/ui-lib/Tooltip/Tooltip";
import { Loader } from "./Loader";
type CommonUiButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "size"
> & {
  id?: string;
  active?: boolean;
  disabled?: boolean;
  tooltip?: string;
  hotkey?: string;
  tooltipPosition?:
    | "right"
    | "top"
    | "top-left"
    | "top-right"
    | "top-center-fixed"
    | "top-right-fixed"
    | "bottom"
    | "bottom-right"
    | "bottom-left"
    | "bottom-left-noWhitespace";
  variant?:
    | "default"
    | "secondary"
    | "tertiary"
    | "quaternary"
    | "primary"
    | "ghost"
    | "ghostFilled";
  size?: "xl" | "lg" | "md" | "sm";
  rounded?:
    | "top"
    | "bottom"
    | "left"
    | "right"
    | "full"
    | "none"
    | "bottom-left"
    | "bottom-right";
  tooltipVariant?: "primary" | "secondary";
  radius?: "xl" | "md" | "sm";
  className?: string;
  toolTipStyle?: CSSProperties;
  hideTooltip?: boolean;
  children: ReactNode;
  loading?: boolean;
};

export const UiButton = forwardRef<HTMLButtonElement, CommonUiButtonProps>(
  (
    {
      children,
      className,
      active = false,
      disabled = false,
      tooltip,
      tooltipPosition = "right",
      hotkey,
      variant = "default",
      size = "xl",
      radius = "xl",
      rounded = "full",
      toolTipStyle,
      tooltipVariant = "primary",
      hideTooltip,
      loading,
      id,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        id={id}
        data-variant={variant}
        className={clsx(
          style.button,
          active && style.active,
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
          loading && style.loading, // Use loading here
          className,
        )}
        ref={ref}
        disabled={disabled}
        {...props}
      >
        {loading && (
          <div className={style.loader}>
            <Loader />
          </div>
        )}
        {children}
        {tooltip && !hideTooltip && (
          <Tooltip
            variant={tooltipVariant}
            inlineStyle={toolTipStyle}
            tooltip={tooltip}
            tooltipPosition={tooltipPosition}
            hotkey={hotkey}
          />
        )}
      </button>
    );
  },
);

UiButton.displayName = "UiButton";
