import { conf } from "microboard-temp";
import { useState } from "react";

export type UITheme = "light" | "dark";

const STORAGE_KEY = "ui-theme";

function applyTheme(theme: UITheme): void {
  document.documentElement.setAttribute("data-theme", theme);
  conf.theme = theme;
}

function getInitialTheme(): UITheme {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function initTheme(): void {
  applyTheme(getInitialTheme());
}

export function toggleUITheme(): UITheme {
  const current = document.documentElement.getAttribute(
    "data-theme",
  ) as UITheme;
  const next: UITheme = current === "dark" ? "light" : "dark";
  localStorage.setItem(STORAGE_KEY, next);
  applyTheme(next);
  return next;
}

export function getCurrentUITheme(): UITheme {
  return (
    (document.documentElement.getAttribute("data-theme") as UITheme) ?? "light"
  );
}

export function useUITheme(): { theme: UITheme; toggle: () => void } {
  const [theme, setTheme] = useState<UITheme>(getCurrentUITheme);
  const toggle = (): void => {
    setTheme(toggleUITheme());
  };
  return { theme, toggle };
}
