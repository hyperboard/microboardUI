import { useCallback, useRef } from "react";

export const useDebounce = (
  callback: (...args: any[]) => unknown,
  delay = 250,
): ((...args: Parameters<(...args: unknown[]) => unknown>) => void) => {
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const debouncedCallback = useCallback(
    (...args: Parameters<typeof callback>) => {
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
