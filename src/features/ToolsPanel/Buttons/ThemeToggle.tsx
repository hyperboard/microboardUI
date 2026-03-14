import React, { useState } from "react";
import { conf } from "microboard-temp";
import { useAppContext } from "features/AppContext";
import { UiButton } from "shared/ui-lib/UiButton";

export function ThemeToggle(): React.ReactElement {
  const { board } = useAppContext();
  const [theme, setTheme] = useState(conf.theme);

  const handleClick = (): void => {
    const next = conf.theme === "light" ? "dark" : "light";
    conf.theme = next;
    setTheme(next);
    // Trigger canvas re-render so all semantic colors update
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
      {theme === "light" ? "☀" : "☾"}
    </UiButton>
  );
}
