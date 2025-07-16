import { useReducer } from "react";

export function useForceUpdate() {
  const [, forceUpdate] = useReducer((c) => c + 1, 0);

  return forceUpdate;
}
