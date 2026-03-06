import clsx from "clsx";
import React, { useCallback, useRef, useState } from "react";
import { Icon } from "shared/ui-lib/Icon";
import { UiButton } from "shared/ui-lib/UiButton";
import { UiPanel } from "shared/ui-lib/UiPanel";
import { BoardItemsList } from "features/SidePanel/BoardItemsList";
import { useHotkey } from "shared/lib/useHotkey";
import { useBoardItemsPanelContext } from "./BoardItemsPanelContext";
import style from "./BoardItemsPanel.module.css";

export function BoardItemsPanel(): React.JSX.Element {
  const { isOpen, openPanel, closePanel } = useBoardItemsPanelContext();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleOpenSearch = useCallback(() => {
    openPanel();
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [openPanel]);

  useHotkey("KeyF", handleOpenSearch, { ctrl: true });

  return (
    <UiPanel padding={0} className={clsx(style.panel, isOpen && style.open)}>
      <div className={style.header}>
        <h3 className={style.title}>Предметы</h3>
        <UiButton
          onClick={closePanel}
          variant="secondary"
          className={style.close}
        >
          <Icon iconName="Close" />
        </UiButton>
      </div>
      <div className={style.search}>
        <Icon
          iconName="Search"
          width={14}
          height={14}
          className={style.searchIcon}
        />
        <input
          className={style.searchInput}
          placeholder="Поиск..."
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button className={style.searchClear} onClick={() => setQuery("")}>
            <Icon iconName="Close" width={12} height={12} />
          </button>
        )}
      </div>
      <div className={style.content}>
        <BoardItemsList query={query} />
      </div>
    </UiPanel>
  );
}
