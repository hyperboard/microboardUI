import clsx, { type ClassValue } from "clsx";
import React, { useState, type MouseEventHandler, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useClickOutside } from "shared/lib/useClickOutside";
import { Icon } from "shared/ui-lib/Icon";
import { Tooltip } from "../Tooltip";
import { TopFade } from "../Transitions/TopFade";
import { UiSkeleton } from "../UiSkeleton";
import styles from "./UiSelector.module.css";

export type Option = {
  label: string;
  value: string | number;
  icon?: ReactNode;
};

type Props = {
  value: string | number;
  options: Option[];
  icon?: ReactNode;
  iconColor?: string;
  onChange?: (value: string | number) => void;
  disabled?: boolean;
  isLoading?: boolean;
  className?: ClassValue;
  disabledTooltip?: string;
};

export function UiSelector({
  options,
  icon,
  iconColor,
  onChange,
  disabled,
  isLoading,
  className,
  value,
  disabledTooltip,
}: Props): JSX.Element {
  const selectedOption = options.find((opt) => opt.value === value);
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const ref = useClickOutside(() => setIsOpen(false));

  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const handleSelectedOptionClick: MouseEventHandler = () => {
    if (disabled || isLoading) {
      return;
    }
    setIsOpen((prev) => !prev);
    if (!isOpen) {
      const rect = ref.current?.getBoundingClientRect();
      if (rect) {
        setPosition({
          top: rect.bottom + 8,
          left: rect.left,
          width: rect.width,
        });
      }
    }
  };

  const handleOptionClick =
    (option: Option): MouseEventHandler =>
    (ev) => {
      ev.stopPropagation();
      ev.preventDefault();
      if (disabled) {
        return;
      }
      setIsOpen(false);
      onChange?.(option.value);
    };

  // Handle mouse events for tooltip
  const handleMouseMove = (e: React.MouseEvent) => {
    if (disabled && disabledTooltip) {
      setTooltipPosition({ x: e.clientX + 10, y: e.clientY + 10 });
    }
  };

  const handleMouseEnter = () => {
    if (disabled && disabledTooltip) {
      setShowTooltip(true);
    }
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  return (
    <div
      ref={ref}
      className={clsx(
        styles.selectorWrapper,
        isOpen && styles.open,
        (disabled || isLoading) && styles.disabled,
        className,
      )}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {isLoading ? (
        <UiSkeleton className={styles.skeleton} />
      ) : (
        <div
          className={styles.selectedOption}
          onClick={handleSelectedOptionClick}
        >
          {selectedOption?.icon && (
            <div className={styles.icon} style={{ color: iconColor }}>
              {selectedOption.icon}
            </div>
          )}
          {icon && !selectedOption?.icon && (
            <div className={styles.icon} style={{ color: iconColor }}>
              {icon}
            </div>
          )}
          <p className={styles.selectedOptionText}>{selectedOption?.label}</p>
          <div className={styles.mark}>
            <Icon width={20} height={20} iconName="mark" />
          </div>
        </div>
      )}
      {createPortal(
        <TopFade inProp={isOpen && !disabled && !isLoading} unmountOnExit>
          <div className={styles.optionsListWrapper} style={position}>
            <ul className={styles.optionsList}>
              {options.map((opt) => (
                <li className={styles.optionWrapper} key={opt.value}>
                  <button
                    onClick={handleOptionClick(opt)}
                    className={clsx(
                      styles.optionBtn,
                      opt.value === selectedOption?.value && styles.selected,
                    )}
                  >
                    <span
                      style={{ color: iconColor }}
                      className={styles.optionIcon}
                    >
                      {opt.icon}
                    </span>
                    <span className={styles.optionText}>{opt.label}</span>
                    <span className={styles.checkMark}>
                      <Icon width={20} height={20} iconName="checkMark" />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </TopFade>,
        document.getElementById("selector")!,
      )}

      {showTooltip &&
        disabledTooltip &&
        createPortal(
          <Tooltip
            variant="withoutArrow"
            tooltip={disabledTooltip}
            inlineStyle={{
              position: "fixed",
              top: `${tooltipPosition.y}px`,
              left: `${tooltipPosition.x}px`,
              zIndex: 10000,
              pointerEvents: "none",
            }}
          />,
          document.body,
        )}
    </div>
  );
}
