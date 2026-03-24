import React from "react";
import { Icon } from "../../shared/ui-lib/Icon";
import type { IconId } from "../../shared/ui-lib/Icon/Icon";
import { DrawingTool } from "microboard-temp";
import { UiButton } from "shared/ui-lib/UiButton";

type Props = {
  onPick: (type: DrawingTool) => void;
  selected?: DrawingTool | "None";
};

export const DrawingToolPicker = ({
  selected,
  onPick,
}: Props): React.ReactElement => {
  const drawingTools = window.MICROBOARD_CONFIG.DRAWING_TOOLS.filter(
    (drawing): drawing is DrawingTool =>
      drawing === "Pen" || drawing === "Eraser" || drawing === "Highlighter",
  );

  return (
    <>
      {drawingTools.map((drawing) => (
        <UiButton
          id={`drawing-${drawing}`}
          onClick={() => onPick(drawing)}
          key={drawing}
          size="md"
          variant="secondary"
          active={selected === drawing}
        >
          <Icon iconName={drawing as IconId} width={24} height={24} />
        </UiButton>
      ))}
    </>
  );
};
