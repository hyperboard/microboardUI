import { useAppSubscription } from "App/useBoardSubscription";
import { useAppContext } from "features/AppContext";
import AIChatPanel from "features/GenerateChart/AIChatPanel";
import React, { useEffect, useState } from "react";
import { useForceUpdate } from "shared/lib/useForceUpdate";
import { UiPanel } from "shared/ui-lib/UiPanel/UiPanel";
import { UiSeparator } from "shared/ui-lib/UiSeparator";
import { AddConnector } from "./Buttons/AddConnector";
import { AddDrawing } from "./Buttons/AddDrawing/AddDrawing";
import { AddFrame } from "./Buttons/AddFrame";
import { AddMedia } from "./Buttons/AddMedia/AddMedia";
import { AddShape } from "./Buttons/AddShape/AddShape";
import { AddSticker } from "./Buttons/AddSticker";
import { AddTemplate } from "./Buttons/AddTemplate";
import { AddText } from "./Buttons/AddText";
import { EventList } from "./Buttons/EventList";
import { Redo } from "./Buttons/Redo";
import { Select } from "./Buttons/Select";
import { Undo } from "./Buttons/Undo";
import { PanelContext } from "./PanelContext";
import style from "./ToolsPanel.module.css";
import { AddStar } from "features/ToolsPanel/Buttons/Star";
import { AddCounter } from "features/ToolsPanel/Buttons/AddCounter";
import { AddCard } from "features/ToolsPanel/Buttons/GameItems/AddCard";
import { AddDice } from "features/ToolsPanel/Buttons/GameItems/AddDice";
import { AddGameItem } from "features/ToolsPanel/Buttons/AddGameItem/AddGameItem";

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
          <AddGameItem />
          <AddTemplate />
          <UiSeparator />
          <Select rounded={"none"} />
          <AddDrawing />
          <AddText />
          <AddShape />
          <AddConnector />
          <AddSticker />
          <AddFrame />
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
