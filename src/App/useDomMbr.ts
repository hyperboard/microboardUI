import { type App } from "App";
import { Board, Mbr } from "microboard-temp";
import { useAppSubscription } from "App/useBoardSubscription";
import {
  useLayoutEffect,
  useReducer,
  useState,
  type RefObject,
  useRef,
} from "react";
import type { SubjectName } from "App/getSubscriptions";
import { updateRects, type UpdateRectsFit } from "shared/lib/updateRects";

type Params = {
  app: App;
  board: Board;
  ref: RefObject<HTMLElement | null>;
  subjects?: SubjectName[];
  targetMbr?: Mbr;
  verticalOffset?: number;
  horizontalOffset?: number;
  fit?: UpdateRectsFit;
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
  const [revision, bumpRevision] = useReducer((value) => value + 1, 0);
  const isMounted = useRef(true);
  const lastMbr = useRef(new Mbr());

  useAppSubscription({
    subjects,
    observer: () => {
      if (isMounted.current) {
        bumpRevision();
      }
    },
  });

  useLayoutEffect(() => {
    isMounted.current = true;
    const newMbr = updateRects(
      board,
      ref,
      targetMbr,
      verticalOffset,
      horizontalOffset,
      fit,
    );
    if (newMbr && !newMbr.isEqual(lastMbr.current)) {
      lastMbr.current = newMbr.copy();
      setMbr(newMbr);
    }
    return () => {
      isMounted.current = false;
    };
  }, [
    board,
    ref,
    fit,
    horizontalOffset,
    verticalOffset,
    revision,
    targetMbr?.left,
    targetMbr?.top,
    targetMbr?.right,
    targetMbr?.bottom,
  ]);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(() => {
      if (isMounted.current) {
        bumpRevision();
      }
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [ref, bumpRevision]);
  return mbr;
}
