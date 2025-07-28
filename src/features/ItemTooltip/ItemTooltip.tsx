import { useDomMbr } from "App/useDomMbr";
import { useAppContext } from "features/AppContext";
import { PanelContext } from "features/ContextPanel/PanelContext";
import { MiroBoardItemTypes } from "features/ImportMiro/ImportMiroBoards/MiroModels";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Tooltip } from "shared/ui-lib/Tooltip";

export function ItemTooltip(): React.JSX.Element {
  const { app, board } = useAppContext();
  const { t } = useTranslation();
  const { items, camera } = board;
  const [openedMenu, setOpenedMenu] = useState("HoverUnderPointer");
  const panelRef = useRef<HTMLDivElement>(null);

  const placeholders = items
    .getUnderPointer()
    .filter(
      (item) =>
        item.itemType === "Placeholder" &&
        item.getMiroData()?.type !== MiroBoardItemTypes.IMAGE,
    );

  const mbr = useDomMbr({
    app,
    board,
    ref: panelRef,
    subjects: undefined,
    targetMbr: placeholders[0]?.getMbr(),
  });

  const toggleMenu = (menu: string): void => {
    setOpenedMenu((prev) => (prev === menu ? "HoverUnderPointer" : menu));
  };

  const windowHeight = board.camera.window.height;

  const isHoverUnderPointer =
    board.selection.getContext() === "HoverUnderPointer";

  const isPlaceholder = placeholders.length === 1;

  const placeholderMbr = placeholders[0]
    ?.getMbr()
    .getTransformed(camera.getMatrix());
  const tooltipPosition =
    placeholderMbr && placeholderMbr.bottom < mbr.top ? "bottom" : "top";

  return (
    <PanelContext.Provider
      value={{
        openedMenu,
        panelMbr: mbr,
        toggleMenu,
        windowHeight,
      }}
    >
      {isHoverUnderPointer && isPlaceholder && (
        <Tooltip
          tooltipAlign={"left"}
          tooltip={t("itemTooltips.placeholder")}
          borderRadius="radiusMd"
          padding="paddingMd"
          style={{
            display: "flex",
            position: "absolute",
            left: mbr.left,
            top: mbr.top,
            height: "fit-content",
          }}
          ref={panelRef}
          tooltipPosition={tooltipPosition}
        />
      )}
    </PanelContext.Provider>
  );
}
