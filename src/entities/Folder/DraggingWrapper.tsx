import { DragOverlay } from "@dnd-kit/core";
import React, { type PropsWithChildren } from "react";
import { createPortal } from "react-dom";

type Props = PropsWithChildren<{}>;

export function DraggingWrapper({ children }: Props) {
  return (
    <>
      {createPortal(
        <DragOverlay>
          <div>{children}</div>
        </DragOverlay>,
        document.getElementById("drag")!,
      )}
    </>
  );
}
