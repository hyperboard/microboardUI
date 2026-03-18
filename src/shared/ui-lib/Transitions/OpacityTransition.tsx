import React, { useRef } from "react";
import { CSSTransition } from "react-transition-group";
import styles from "./OpacityTransition.module.css";
import type { TransitionProps } from "./types";

export function OpacityTransition({
  inProp,
  children,
  timeout = 300,
  unmountOnExit,
}: TransitionProps) {
  const nodeRef = useRef<HTMLElement>(null);
  return (
    <CSSTransition
      in={inProp}
      timeout={timeout}
      classNames={{
        enter: styles.opacityEnter,
        enterActive: styles.opacityEnterActive,
        exit: styles.opacityExit,
        exitActive: styles.opacityExitActive,
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
