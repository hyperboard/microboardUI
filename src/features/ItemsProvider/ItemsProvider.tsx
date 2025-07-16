import React from "react";
import { useAppSubscription } from "App/useBoardSubscription";
import { useForceUpdate } from "shared/lib/useForceUpdate";
import { useAppContext } from "features/AppContext";
import { VideoCanvasControls } from "features/VideoPlayer/VideoCanvasControls";

interface Props {
  itemsComponents: Record<string, React.ComponentType<any>>;
}

export const ItemsProvider = ({ itemsComponents }: Props): JSX.Element => {
  const { board } = useAppContext();
  const forceUpdate = useForceUpdate();

  useAppSubscription({
    subjects: ["items", "camera"],
    observer: () => {
      forceUpdate();
    },
  });

  const items = board.items.listAll().filter((item) => {
    if (!item.shouldUseCustomRender) {
      return false;
    }

    if (!item.shouldRenderOutsideViewRect) {
      return item.isEnclosedOrCrossedBy(board.camera.getMbr());
    }
    return true;
  });

  return (
    <>
      {items.map((item) => {
        const ItemComponent = itemsComponents[item.itemType];
        if (!ItemComponent) {
          return null;
        }
        return <ItemComponent key={item.id} item={item} />;
      })}
      <VideoCanvasControls />
    </>
  );
};
