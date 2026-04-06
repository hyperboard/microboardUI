import React, { useEffect, useRef, useState } from "react";
import { useAppSubscription } from "App/useBoardSubscription";
import { useAppContext } from "features/AppContext";
import { useDomMbr } from "App/useDomMbr";
import styles from "./HyperLink.module.css";
import { Mbr } from "microboard-temp";
import { useForceUpdate } from "shared/lib/useForceUpdate";

export const HyperLink = () => {
  const [currentLink, setCurrentLink] = useState<{
    hyperLink: string;
    linkMbr: Mbr;
  } | null>(null);
  const [isTooltipUnderPointer, setIsTooltipUnderPointer] = useState(false);
  const { board, app } = useAppContext();
  const forceUpdate = useForceUpdate();

  const link = board.items
    .getUnderPointer()
    .pop()
    ?.getRichText()
    ?.getHyperLinkByPointerCoordinates(board.pointer.point);

  useEffect(() => {
    if (isTooltipUnderPointer) {
      return;
    }

    if (link && link.hyperLink !== currentLink?.hyperLink) {
      setCurrentLink(link);
      return;
    }

    if (!link && currentLink) {
      setCurrentLink(null);
    }
  }, [currentLink, isTooltipUnderPointer, link]);

  useAppSubscription({
    subjects: ["pointer"],
    observer: () => forceUpdate(),
  });
  const linkContainerRef = useRef<HTMLDivElement>(null);

  const mbr = useDomMbr({
    app,
    board,
    ref: linkContainerRef,
    targetMbr: currentLink?.linkMbr,
    subjects: ["selection", "selectionItem"],
    fit: "hyperLink",
  });

  if (
    (!isTooltipUnderPointer && !currentLink) ||
    board.selection.getContext() === "EditTextUnderPointer"
  ) {
    return null;
  }

  return (
    <div
      ref={linkContainerRef}
      className={styles.linkContainer}
      style={{
        top: mbr.top,
        left: mbr.left,
      }}
      onMouseEnter={() => setIsTooltipUnderPointer(true)}
      onMouseLeave={() => setIsTooltipUnderPointer(false)}
    >
      <a
        className={styles.link}
        target="_blank"
        href={currentLink?.hyperLink}
        rel="noreferrer"
      >
        {currentLink?.hyperLink}
      </a>
    </div>
  );
};
