import { getHotkeyLabel, Mbr } from "microboard-temp";
import { useAppSubscription } from "App/useBoardSubscription";
import { useAppContext } from "features/AppContext";
import { Icon } from "shared/ui-lib/Icon";
import { UiPanel } from "shared/ui-lib/UiPanel/UiPanel";
import { useForceUpdate } from "shared/lib/useForceUpdate";
import React from "react";
import { useTranslation } from "react-i18next";
import style from "./ZoomPanel.module.css";
import clsx from "clsx";
import { useMediaQuery } from "shared/lib/useMediaQuery";
import { UiButton } from "shared/ui-lib/UiButton";
import { UiSeparator } from "shared/ui-lib/UiSeparator";

export function ZoomPanel() {
  const { board } = useAppContext();
  const forceUpdate = useForceUpdate();
  useAppSubscription({
    subjects: ["camera"],
    observer: forceUpdate,
  });
  const { t } = useTranslation();
  const isMobile = useMediaQuery("screen and (max-width: 1200px)");

  const zoomToFit = (): void => {
    const items = [...board.items.listAll(), ...board.items.listFrames()];
    if (items.length > 0) {
      const rect = new Mbr(1000_000, 1000_000, -1000_000, -1000_000);
      items.forEach((item) => rect.combine([item.getMbr()]));
      board.camera.zoomToFit(rect);
    }
  };

  const handleZoomIn = () => {
    board.camera.zoomInToViewCenter();
  };
  const handleZoomOut = () => {
    board.camera.zoomOutFromViewCenter();
  };
  const handleDefaultZoom = () => {
    board.camera.zoomToViewCenter(1);
  };

  const scale = board.camera.getScale();
  const currentScale = scale < 0.01 ? 1 : Math.round(scale * 100);

  return (
    <UiPanel
      className={clsx(
        style.panel,
        board.getInterfaceType() === "view" && style.defaultPosition,
      )}
      padding={0}
    >
      <UiButton
        className={style.zoomToFit}
        id="zoom-to-fit"
        tooltip={t("zoomPanel.zoomToFit.tooltip")}
        tooltipPosition={isMobile ? "top-right" : "top"}
        onClick={zoomToFit}
        variant="secondary"
        rounded="left"
      >
        <Icon iconName="ZoomToFit" />
      </UiButton>
      <UiSeparator vertical className={style.tableHide} />
      <UiButton
        className={style.tableHide}
        id={"zoom-out"}
        tooltipPosition="top"
        tooltip={t("zoomPanel.zoomOut.tooltip")}
        hotkey={getHotkeyLabel("zoomOut")}
        onClick={handleZoomOut}
        variant="secondary"
        rounded="none"
      >
        <Icon iconName="Minus" />
      </UiButton>
      <UiButton
        className={clsx(style.tableHide, style.zoom)}
        id={"zoom-default"}
        tooltipPosition="top"
        tooltip={t("zoomPanel.zoomDefault.tooltip")}
        hotkey={getHotkeyLabel("zoomDefault")}
        onClick={handleDefaultZoom}
        variant="secondary"
        rounded="none"
      >
        {currentScale}%
      </UiButton>
      <UiButton
        className={style.tableHide}
        id={"zoom-in"}
        tooltipPosition="top-right"
        tooltip={t("zoomPanel.zoomIn.tooltip")}
        hotkey={getHotkeyLabel("zoomIn")}
        onClick={handleZoomIn}
        variant="secondary"
        rounded="right"
      >
        <Icon iconName="Plus" />
      </UiButton>
    </UiPanel>
  );
}
