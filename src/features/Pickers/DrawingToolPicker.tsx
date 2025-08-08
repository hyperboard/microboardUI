import React from "react";
import { Icon } from "../../shared/ui-lib/Icon";
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
  return (
    <>
      {window.MICROBOARD_CONFIG.DRAWING_TOOLS.map((drawing) => (
        <UiButton
          id={`drawing-${drawing}`}
          onClick={() => onPick(drawing)}
          key={drawing}
          size="md"
          variant="secondary"
          active={selected === drawing}
        >
          <Icon iconName={drawing} width={24} height={24} />
        </UiButton>
      ))}
    </>
  );
};
