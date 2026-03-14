import React from "react";
import { CONTRAST_PALETTE_LIST, semanticColor, conf } from "microboard-temp";
import { ColorItem } from "./ColorItem";
import { getSemanticId } from "shared/lib/resolveColorValue";

type Props = {
  onPick: (color: string) => void;
  currentValue?: unknown;
  id?: string;
};

export function SemanticColorPicker({
  onPick,
  currentValue,
  id = "",
}: Props): React.ReactElement {
  const activeSemanticId = getSemanticId(currentValue);

  return (
    <>
      {CONTRAST_PALETTE_LIST.map((pair) => {
        const displayColor = conf.theme === "light" ? pair.light : pair.dark;
        return (
          <ColorItem
            key={pair.id}
            id={id ? `${id}-sem-${pair.id}` : ""}
            color={displayColor}
            active={activeSemanticId === pair.id}
            onPick={() => onPick(semanticColor(pair.id) as unknown as string)}
          />
        );
      })}
    </>
  );
}
