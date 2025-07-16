import type { PropsWithChildren } from "react";

export type TransitionProps = PropsWithChildren<{
  inProp?: boolean;
  timeout?: number;
  unmountOnExit?: boolean;
}>;
