import React, { useEffect, useRef, useState } from "react";
import { UiPanel } from "shared/ui-lib/UiPanel";
import { useDomMbr } from "App/useDomMbr";
import { useAppContext } from "features/AppContext";
import { Mbr } from "microboard-temp";
import { useForceUpdate } from "shared/lib/useForceUpdate";
import { useAppSubscription } from "App/useBoardSubscription";
import { UiSeparator } from "shared/ui-lib/UiSeparator/UiSeparator";
import { Comments } from "entities/BoardMenu/sections/Comments";
import { Items } from "entities/BoardMenu/sections/Items";
import { MouseOrTrackpad } from "entities/BoardMenu/sections/MouseOrTrackpad";
import styles from "./BoardMenu.module.css";

export const BoardMenu = () => {
  const menuRef = useRef<HTMLDivElement>(null);
  const { board, app } = useAppContext();
  const [anchorPoint, setAnchorPoint] = useState(() =>
    board.pointer.point.copy(),
  );
  const wasOpen = useRef(false);

  const forceUpdate = useForceUpdate();

  useAppSubscription({
    subjects: [
      "items",
      "tools",
      "selection",
      "selectionItem",
      "selectionItems",
    ],
    observer: () => {
      forceUpdate();
    },
  });

  const isOpen = board.getIsBoardMenuOpen();

  useEffect(() => {
    if (isOpen && !wasOpen.current) {
      setAnchorPoint(board.pointer.point.copy());
    }
    wasOpen.current = isOpen;
  }, [board, isOpen]);

  const mbr = useDomMbr({
    app,
    board,
    ref: menuRef,
    targetMbr: new Mbr(
      anchorPoint.x,
      anchorPoint.y,
      anchorPoint.x,
      anchorPoint.y,
    ),
    subjects: ["camera"],
    fit: "boardMenu",
  });

  const isNavigate = Boolean(board.tools.getNavigate());

  return isOpen && !isNavigate ? (
    <UiPanel
      vertical={true}
      ref={menuRef}
      style={{
        position: "absolute",
        left: mbr.left,
        top: mbr.top,
        gap: "2px",
      }}
      padding={4}
      zIndex={5}
    >
      <Items />
      <UiSeparator className={styles.separator} vertical={false} />
      <MouseOrTrackpad />
      <UiSeparator className={styles.separator} vertical={false} />
      <Comments />
    </UiPanel>
  ) : (
    <></>
  );
};
