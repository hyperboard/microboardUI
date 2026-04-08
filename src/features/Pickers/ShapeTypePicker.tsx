import React, { CSSProperties, useRef, useState } from "react";
import type { OverlayOptionDefinition, ShapeType } from "microboard-temp";
import { useTranslation } from "react-i18next";
import { UiButton } from "shared/ui-lib/UiButton";
import { OverlayMetadataIcon } from "features/OverlayUI/OverlayMetadataIcon";
import { type ShapeFamilyName } from "features/ShapesPanel/shapeMetadata";

type Props = {
  onPick: (
    type: ShapeType,
    category?: ShapeFamilyName,
    e?: React.MouseEvent<HTMLButtonElement>,
  ) => void;
  selected?: ShapeType | "None";
  categoryName: ShapeFamilyName;
  options: OverlayOptionDefinition[];
  buttonSize?: "lg" | "md" | "sm";
};

export function ShapePicker({
  onPick,
  selected,
  categoryName,
  options,
  buttonSize = "md",
}: Props): React.ReactElement {
  const [toolTipStyle, setToolTipStyle] = useState<CSSProperties | undefined>(
    undefined,
  );
  const refs = useRef({});
  const { t } = useTranslation();

  const getToolTipStyle = (shapeId: string): CSSProperties => {
    const { left, top } = refs.current[shapeId].getBoundingClientRect();
    return {
      left: `calc(${left + 24}px - 1rem)`,
      bottom: `calc(100% - ${top}px + 0.6rem)`,
    };
  };

  const setRef = (name: string) => (el: HTMLButtonElement) => {
    refs.current[name] = el;
  };

  return (
    <>
      {options.map((option) => {
        const shape = option.value as ShapeType;
        const tooltipKey = `shapePicker.${categoryName}.${shape}` as never;
        return (
          <UiButton
            ref={setRef(option.id)}
            tooltipPosition={"top-right-fixed"}
            tooltip={
              categoryName !== "basicShapes"
                ? String(t(tooltipKey, { defaultValue: option.label }))
                : undefined
            }
            id={`shape-${shape}`}
            onClick={(e) => onPick(shape, categoryName, e)}
            key={option.id}
            size={buttonSize}
            variant="secondary"
            active={selected === shape}
            onMouseEnter={() => setToolTipStyle(getToolTipStyle(option.id))}
            toolTipStyle={toolTipStyle}
          >
            <OverlayMetadataIcon
              icon={option.icon}
              label={option.label}
              size={20}
            />
          </UiButton>
        );
      })}
    </>
  );
}
