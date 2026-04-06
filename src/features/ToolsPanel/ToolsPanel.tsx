import { useAppSubscription } from "App/useBoardSubscription";
import { useAppContext } from "features/AppContext";
import AIChatPanel from "features/GenerateChart/AIChatPanel";
import React, { useEffect, useState } from "react";
import { useForceUpdate } from "shared/lib/useForceUpdate";
import { UiPanel } from "shared/ui-lib/UiPanel/UiPanel";
import { UiSeparator } from "shared/ui-lib/UiSeparator";
import { AddMedia } from "./Buttons/AddMedia/AddMedia";
import { AddTemplate } from "./Buttons/AddTemplate";
import { EventList } from "./Buttons/EventList";
import { Redo } from "./Buttons/Redo";
import { Select } from "./Buttons/Select";
import { Undo } from "./Buttons/Undo";
import { PanelContext } from "./PanelContext";
import style from "./ToolsPanel.module.css";
import { AddCard } from "features/ToolsPanel/Buttons/AddGameItem/AddCard";
import { OverlayToolbarTools } from "features/OverlayUI/overlayUi";

export function ToolsPanel(): React.JSX.Element {
  const [openedMenu, setOpenedMenu] = useState("None");

  const toggleMenu = (menu: string): void =>
    setOpenedMenu((prev) => (prev === menu ? "None" : menu));

  const { app } = useAppContext();
  const forceUpdate = useForceUpdate();
  useAppSubscription({
    subjects: ["tools"],
    observer: forceUpdate,
  });

  useEffect(() => {}, [window.showDebug]);

  return (
    <PanelContext.Provider value={{ toggleMenu, openedMenu }}>
      <div
        className={
          window.location.protocol === "file:"
            ? style.localWrapper
            : style.wrapper
        }
      >
        <UiPanel vertical padding={0} zIndex={20}>
          {OverlayToolbarTools()}
          <AddCard />
          <AddTemplate />
          <UiSeparator />
          <Select rounded={"none"} />
          <AddMedia />
        </UiPanel>
        <UiPanel vertical padding={0}>
          <Undo />
          <Redo />
        </UiPanel>
        <div className={style.bottomLeftWrapper}>
          {window.showDebug && <EventList />}
          {window.enableDiagrams && <AIChatPanel board={app.getBoard()} />}
        </div>
      </div>
    </PanelContext.Provider>
  );
}
