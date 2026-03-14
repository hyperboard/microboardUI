import React from "react";
import { CONTRAST_PALETTE_LIST, semanticColor, conf } from "microboard-temp";
import { ColorItem } from "./ColorItem";
import { SquareColorItem } from "./SquareColorItem";
import { getSemanticId } from "shared/lib/resolveColorValue";

type Props = {
  onPick: (color: string) => void;
  currentValue?: unknown;
  id?: string;
  role?: "background" | "foreground";
  variant?: "circle" | "square";
};

export function SemanticColorPicker({
  onPick,
  currentValue,
  id = "",
  role = "background",
  variant = "circle",
}: Props): React.ReactElement {
  const activeSemanticId = getSemanticId(currentValue);

  return (
    <>
      {CONTRAST_PALETTE_LIST.map((pair) => {
        const isForeground = role === "foreground";
        const isLight = conf.theme === "light";
        const displayColor = isForeground
          ? isLight
            ? pair.dark
            : pair.light
          : isLight
            ? pair.light
            : pair.dark;
        const semanticValue = semanticColor(pair.id) as unknown as string;
        if (variant === "square") {
          return (
            <SquareColorItem
              key={pair.id}
              id={id ? `${id}-sem-${pair.id}` : ""}
              color={displayColor}
              selected={activeSemanticId === pair.id}
              tooltip={pair.label}
              onPick={() => onPick(semanticValue)}
            />
          );
        }
        return (
          <ColorItem
            key={pair.id}
            id={id ? `${id}-sem-${pair.id}` : ""}
            color={displayColor}
            active={activeSemanticId === pair.id}
            tooltip={pair.label}
            onPick={() => onPick(semanticValue)}
          />
        );
      })}
    </>
  );
}
