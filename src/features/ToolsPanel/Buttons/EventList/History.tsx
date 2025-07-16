import { BoardEvent } from "microboard-temp";
import React, { CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "features/AppContext";
import { UiButton } from "shared/ui-lib/UiButton";
import { UiPanel } from "shared/ui-lib/UiPanel";
import EventComponent from "./HistoryEvent";
import { notify } from "shared/ui-lib/Toast";
import { RawEvents } from "shared/RawEvents";

interface Props {
  style?: React.CSSProperties;
  events: RawEvents;
}

export const History = React.memo(function History({
  style,
  events,
}: Props): JSX.Element {
  const { t } = useTranslation();
  const { board } = useAppContext();

  const headerStyle: CSSProperties = {
    fontWeight: "bold",
    display: "flex",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  };

  const handleExport = (): void => {
    const data = board.events?.getRaw();
    if (!data) {
      return;
    }

    const jsonData = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonData], { type: "application/json" });
    const link = document.createElement("a");
    link.download = `events_${
      data.confirmedEvents[data.confirmedEvents.length - 1].order
    }_${board.getBoardId()}.json`;
    link.href = URL.createObjectURL(blob);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const handleImport = (): void => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.multiple = false;
    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) {
        return;
      }

      const text = await file.text();
      try {
        const data = JSON.parse(text);
        const { confirmedEvents, eventsToSend, newEvents } = data as RawEvents;
        const events = [...confirmedEvents, ...eventsToSend, ...newEvents];
        events.forEach((event) => {
          board.emit(event.body.operation);
        });
      } catch (error) {
        console.error("Error parsing JSON:", error);
        notify({
          variant: "error",
          header: "Error during import",
        });
      }
    };
    input.click();
  };

  return (
    <UiPanel
      style={{
        ...style,
        alignItems: "start",
      }}
      vertical
      padding={6}
      gap={6}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <UiButton
          onClick={handleImport}
          style={{ width: "100%" }}
          variant="tertiary"
        >
          import
        </UiButton>
        <UiButton
          style={{ width: "100%" }}
          onClick={handleExport}
          variant="tertiary"
        >
          export
        </UiButton>
      </div>
      {Object.entries(events).map(
        ([eventType, events]: [string, BoardEvent[]]) => (
          <React.Fragment key={`fragment_${eventType}`}>
            <div style={headerStyle} key={`eventList_${eventType}`}>
              {eventType
                .replace(/([a-z])([A-Z])/g, "$1 $2")
                .replace(/^./, (str) => str.toUpperCase())}
            </div>
            {/* TODO replace with pagination */}
            {events
              .reverse()
              .slice(0, 100)
              .map((event, idx) => (
                <EventComponent
                  event={event}
                  key={`${event.body.eventId}_${idx}`}
                />
              ))}
          </React.Fragment>
        ),
      )}
    </UiPanel>
  );
});
