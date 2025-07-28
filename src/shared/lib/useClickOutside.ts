import { useEffect, useRef, RefObject } from "react";

type ClickOutsideCb = () => void;

export const useClickOutside = <T extends HTMLElement = HTMLDivElement>(
  callback: ClickOutsideCb,
  refs: (RefObject<HTMLElement> | null)[] = [],
  considerCanvasAsOutside = false,
  disable?: boolean,
): RefObject<T> => {
  const ref = useRef<T>(null);

  const handleClickOutside = (event: MouseEvent): void => {
    const isOutside =
      ref.current &&
      !ref.current.contains(event.target as Node) &&
      refs.every((ref) => {
        if (!ref?.current) {
          return true;
        }
        return ref.current && !ref.current.contains(event.target as Node);
      });

    if (
      isOutside ||
      (considerCanvasAsOutside &&
        event.target instanceof HTMLCanvasElement &&
        event.target.className === "NoContextMenu")
    ) {
      callback();
    }
  };

  useEffect(() => {
    if (disable) {
      return;
    }
    document.body.addEventListener("click", handleClickOutside);
    return () => {
      if (disable) {
        return;
      }
      document.body.removeEventListener("click", handleClickOutside);
    };
  }, [callback]);

  return ref;
};
