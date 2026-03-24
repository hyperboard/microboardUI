import { useCallback, useRef } from "react";

export const useDebounce = <TArgs extends unknown[]>(
  callback: (...args: TArgs) => unknown,
  delay = 250,
): ((...args: TArgs) => void) => {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debouncedCallback = useCallback(
    (...args: TArgs) => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
      timer.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay],
  );

  return debouncedCallback;
};
