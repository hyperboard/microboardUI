import clsx from "clsx";
import React, {
  useState,
  type HTMLAttributes,
  type PropsWithChildren,
  type ReactElement,
} from "react";
import styles from "./UiAccordion.module.css";

type ToggleFunc = () => void;

type Props = HTMLAttributes<HTMLDivElement> &
  PropsWithChildren<{
    renderButton: (toggle: ToggleFunc, isOpen: boolean) => ReactElement;
    openedHeight: number | string;
    closedHeight: number | string;
    contentClassName?: string;
  }>;

export function UiAccordion({
  renderButton,
  closedHeight,
  openedHeight,
  children,
  style,
  className,
  contentClassName,
  ...props
}: Props): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = (): void => setIsOpen((prev) => !prev);
  return (
    <div className={className}>
      <div
        className={clsx(contentClassName, styles.accordionContent)}
        style={{
          maxHeight: isOpen ? openedHeight : closedHeight,
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
      {renderButton(toggle, isOpen)}
    </div>
  );
}
