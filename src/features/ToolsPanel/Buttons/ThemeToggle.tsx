import React, { useState } from "react";
import { conf } from "microboard-temp";
import { useAppContext } from "features/AppContext";
import { UiButton } from "shared/ui-lib/UiButton";

function SunIcon(): React.ReactElement {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="10" cy="10" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      <line
        x1="10"
        y1="1"
        x2="10"
        y2="3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="10"
        y1="16.5"
        x2="10"
        y2="19"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="19"
        y1="10"
        x2="16.5"
        y2="10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="3.5"
        y1="10"
        x2="1"
        y2="10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="16.07"
        y1="3.93"
        x2="14.31"
        y2="5.69"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="5.69"
        y1="14.31"
        x2="3.93"
        y2="16.07"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="16.07"
        y1="16.07"
        x2="14.31"
        y2="14.31"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="5.69"
        y1="5.69"
        x2="3.93"
        y2="3.93"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon(): React.ReactElement {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M17 12.5A7.5 7.5 0 1 1 7.5 3a5.5 5.5 0 0 0 9.5 9.5z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ThemeToggle(): React.ReactElement {
  const { board } = useAppContext();
  const [theme, setTheme] = useState(conf.theme);

  const handleClick = (): void => {
    const next = conf.theme === "light" ? "dark" : "light";
    conf.theme = next;
    setTheme(next);
    board.items.subject.publish(board.items);
  };

  return (
    <UiButton
      id="theme-toggle"
      tooltip={
        theme === "light" ? "Switch to dark theme" : "Switch to light theme"
      }
      onClick={handleClick}
      variant="secondary"
      rounded="none"
    >
      {theme === "light" ? <MoonIcon /> : <SunIcon />}
    </UiButton>
  );
}
