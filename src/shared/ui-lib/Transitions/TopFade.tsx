import React, { useRef } from "react";
import { CSSTransition } from "react-transition-group";
import type { TransitionProps } from "./types";
import styles from "./TopFade.module.css";

export function TopFade({
  inProp,
  timeout = 300,
  unmountOnExit,
  children,
}: TransitionProps) {
  const nodeRef = useRef<HTMLElement>(null);
  return (
    <CSSTransition
      in={inProp}
      timeout={timeout}
      classNames={{
        enter: styles.optionsEnter,
        enterActive: styles.optionsEnterActive,
        exit: styles.optionsExit,
        exitActive: styles.optionsExitActive,
      }}
      unmountOnExit={unmountOnExit}
      nodeRef={nodeRef}
    >
      {React.isValidElement(children)
        ? React.cloneElement(
            children as React.ReactElement<{ ref?: React.Ref<HTMLElement> }>,
            { ref: nodeRef },
          )
        : children}
    </CSSTransition>
  );
}
