import { useAppSubscription } from "App/useBoardSubscription";
import { UiPanel } from "shared/ui-lib/UiPanel/UiPanel";
import { useForceUpdate } from "shared/lib/useForceUpdate";
import React, { useEffect } from "react";
import { EventList } from "./Buttons/EventList";
import { Grab } from "./Buttons/Grab";
import { Select } from "./Buttons/Select";
import style from "./ToolsPanel.module.css";
import { UiSeparator } from "shared/ui-lib/UiSeparator";

export function ViewToolsPanel(): JSX.Element {
  const forceUpdate = useForceUpdate();
  useAppSubscription({
    subjects: ["tools"],
    observer: forceUpdate,
  });

  useEffect(() => {}, [window.showDebug]);

  return (
    <div className={style.wrapper}>
      <UiPanel vertical padding={0} zIndex={20}>
        <Grab />
        <UiSeparator />
        <Select rounded="bottom" />
      </UiPanel>
      {window.showDebug && <EventList />}
    </div>
  );
}
