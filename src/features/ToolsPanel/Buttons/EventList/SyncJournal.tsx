import React, { memo } from "react";
import { UiPanel } from "shared/ui-lib/UiPanel";
import EventComponent from "./HistoryEvent";
import { SyncLog } from "microboard-temp";
import { useAppContext } from "features/AppContext";
import { UiButton } from "shared/ui-lib/UiButton";

interface Props {
  style?: React.CSSProperties;
  log: SyncLog;
}

export const SyncJournal = memo(function SyncJournal({
  style,
  log,
}: Props): React.JSX.Element {
  const eventsLog = log.map((logMsg) => ({
    msg: logMsg.msg,
    events: logMsg.records.map((record) => record.event),
  }));
  const { board } = useAppContext();

  const handleExport = (): void => {
    const data = eventsLog;
    const confirmedEvents = board.events?.log.list
      .getConfirmedRecords()
      .map((record) => record.event);

    const jsonData = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonData], { type: "application/json" });
    const link = document.createElement("a");
    link.download = `syncLog_${
      confirmedEvents?.[confirmedEvents.length - 1].order
    }_${board.getBoardId()}.json`;
    link.href = URL.createObjectURL(blob);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
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
      <UiButton
        style={{ width: "100%" }}
        onClick={handleExport}
        variant="tertiary"
      >
        export
      </UiButton>
      {/* TODO replace with pagination */}
      {eventsLog
        .reverse()
        .slice(0, 100)
        .map(
          (logMsg, idx) =>
            logMsg.events.length > 0 && (
              <React.Fragment key={`${logMsg.msg}_${idx}`}>
                <span key={`${logMsg.msg}_${idx}_span`}>
                  <b>
                    {logMsg.msg
                      .replace(/([a-z])([A-Z])/g, "$1 $2")
                      .replace(/^./, (str) => str.toUpperCase())}
                  </b>
                  {logMsg.events.reverse().map((event, idx) => (
                    <EventComponent
                      event={event}
                      key={`${event.body.eventId}_${idx}`}
                    />
                  ))}
                </span>
              </React.Fragment>
            ),
        )}
    </UiPanel>
  );
});
