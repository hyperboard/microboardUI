import { UiSlider } from "shared/ui-lib/UiSlider";
import React from "react";
import { useTranslation } from "react-i18next";
import style from "./SliderPicker.module.css";

type Props = {
  min: number;
  max: number;
  value?: number;
  step: number;
  onPick: (val: number) => void;
  showLabel?: boolean;
  id?: string;
};

export function SliderPicker({
  onPick,
  min,
  max,
  value,
  showLabel,
  id,
  step,
}: Props): React.ReactElement {
  const { t } = useTranslation();
  return (
    <div className={style.container}>
      <UiSlider
        min={min}
        max={max}
        step={step}
        value={value}
        id={id}
        onChange={onPick}
      />
      {showLabel && (
        <label className={style.label}>
          {t("toolsPanel.addDrawing.strokeWidth")}
        </label>
      )}
    </div>
  );
}
