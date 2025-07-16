import React, {
  useLayoutEffect,
  useRef,
  useState,
  type MouseEventHandler,
  type MutableRefObject,
  type ReactNode,
  type Ref,
  type RefObject,
} from "react";
import style from "./UiSwitch.module.css";
import clsx from "clsx";

type Value = string | number | boolean;
type Option = {
  value: Value;
  label:
    | string
    | ((props: {
        textClass: string;
        btnClass: string;
        handleClick: MouseEventHandler;
        value: Value;
        isActive: boolean;
        activeClass: string;
        ref: RefObject<(HTMLElement | null)[]>;
      }) => ReactNode);
};
type Props = {
  value?: Value;
  options: Option[];
  onChange?: (value: Value) => void;
};

export function UiSwitch({ onChange, options, value }: Props) {
  const switchRef = useRef<HTMLDivElement>(null);
  const optionsRefs = useRef<(HTMLElement | null)[]>([]);

  const calcSelectorStyles = (elem: HTMLElement) => {
    const parent = elem.parentElement;
    if (parent) {
      const parentRect = parent.getBoundingClientRect();
      const btnRect = elem.getBoundingClientRect();
      const position = btnRect.left - parentRect.left;
      switchRef.current?.style.setProperty?.("--width", `${btnRect.width}px`);
      switchRef.current?.style.setProperty?.("--left", `${position}px`);
    }
  };

  useLayoutEffect(() => {
    const initialOptionIndex = options.findIndex(
      ({ value: optionValue }) => optionValue === value,
    );
    const selectedOptionRef =
      optionsRefs.current[initialOptionIndex === -1 ? 0 : initialOptionIndex];
    if (selectedOptionRef) {
      calcSelectorStyles(selectedOptionRef);
    }
  }, [value]);
  const handleOptionClick =
    (value: Value): MouseEventHandler =>
    (evt) => {
      evt.preventDefault();
      evt.stopPropagation();
      onChange?.(value);
      calcSelectorStyles(evt.currentTarget as HTMLElement);
    };

  return (
    <div className={style.switch} ref={switchRef}>
      {options.map(({ value: optionValue, label }) =>
        typeof label === "function" ? (
          label({
            textClass: style.btnText,
            btnClass: style.btn,
            handleClick: handleOptionClick(optionValue),
            value: optionValue,
            isActive: value === optionValue,
            activeClass: style.active,
            ref: optionsRefs as RefObject<(HTMLElement | null)[]>,
          })
        ) : (
          <button
            key={label}
            className={clsx(style.btn, optionValue === value && style.active)}
            onClick={handleOptionClick(optionValue)}
            ref={(ref) => optionsRefs.current.push(ref)}
          >
            <span className={style.btnText}>{label}</span>
          </button>
        ),
      )}
    </div>
  );
}
