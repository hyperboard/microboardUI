import { type App } from "App";
import { Mbr, updateRects, Board } from "microboard-temp";
import { useAppSubscription } from "App/useBoardSubscription";
import { useForceUpdate } from "shared/lib/useForceUpdate";
import { useEffect, useState, type RefObject, useRef } from "react";
import type { SubjectName } from "App/getSubscriptions";

type Params = {
  app: App;
  board: Board;
  ref: RefObject<HTMLElement>;
  subjects?: SubjectName[];
  targetMbr?: Mbr;
  verticalOffset?: number;
  horizontalOffset?: number;
  fit?:
    | "contextPanel"
    | "linkToBtn"
    | "comment"
    | "threadPanel"
    | "boardMenu"
    | "hyperLink";
};

export function useDomMbr({
  app,
  board,
  ref,
  subjects = ["camera", "selection"],
  targetMbr,
  horizontalOffset,
  verticalOffset,
  fit = "contextPanel",
}: Params) {
  const [mbr, setMbr] = useState(new Mbr());
  const forceUpdate = useForceUpdate();
  const isMounted = useRef(true);

  useAppSubscription({
    subjects,
    observer: () => {
      if (isMounted.current) {
        forceUpdate();
      }
    },
  });
  useEffect(() => {
    isMounted.current = true;
    const newMbr = updateRects(
      board,
      ref,
      targetMbr,
      verticalOffset,
      horizontalOffset,
      fit,
    );
    if (newMbr && !newMbr?.isEqual(mbr)) {
      setMbr(newMbr);
    }
    return () => {
      isMounted.current = false;
    };
  });
  return mbr;
}
