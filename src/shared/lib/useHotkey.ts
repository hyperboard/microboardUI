import { useEffect } from "react";

interface HotkeyOptions {
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
}

export function useHotkey(
  code: string,
  callback: () => void,
  options: HotkeyOptions = {},
): void {
  useEffect(() => {
    const { ctrl = false, shift = false, alt = false } = options;
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target.isContentEditable
      ) {
        return;
      }
      if (
        event.code === code &&
        (ctrl
          ? event.ctrlKey || event.metaKey
          : !event.ctrlKey && !event.metaKey) &&
        event.shiftKey === shift &&
        event.altKey === alt
      ) {
        event.preventDefault();
        callback();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [code, callback, options.ctrl, options.shift, options.alt]);
}
