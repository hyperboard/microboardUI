import React, { useRef } from "react";
import { CSSTransition } from "react-transition-group";
import styles from "./FadeTransition.module.css";
import type { TransitionProps } from "./types";

export function FadeTransition({
  inProp,
  children,
  timeout = 500,
  unmountOnExit,
}: TransitionProps): React.JSX.Element {
  const nodeRef = useRef<HTMLElement>(null);
  return (
    <CSSTransition
      in={inProp}
      timeout={timeout}
      classNames={{
        enter: styles.fadeEnter,
        enterActive: styles.fadeEnterActive,
        exit: styles.fadeExit,
        exitActive: styles.fadeExitActive,
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
