import React from "react";
import {
  ConnectorPointerIcon,
  type ConnectorPointerType,
} from "shared/ui-lib/Icon";
import { UiButton } from "shared/ui-lib/UiButton";
import style from "./ConnectorPointerPicker.module.css";

const CONNECTOR_POINTER_TYPES: ConnectorPointerType[] = [
  "None",
  "ArrowBroad",
  "ArrowThin",
  "TriangleFilled",
  "CircleFilled",
  "Angle",
  "TriangleEmpty",
  "DiamondFilled",
  "DiamondEmpty",
  "Zero",
  "One",
  "Many",
  "ManyMandatory",
  "OneMandatory",
  "ManyOptional",
  "OneOptional",
];

type Props = {
  onPick: (pointer: ConnectorPointerType) => void;
  selected: ConnectorPointerType;
};

export function ConnectorPointerPicker({
  onPick,
  selected,
}: Props): React.ReactElement {
  return (
    <>
      {CONNECTOR_POINTER_TYPES.map((type) => (
        <UiButton
          id={`pointer-${type}`}
          key={type}
          onClick={() => {
            onPick(type);
          }}
          active={selected === type}
          variant="secondary"
          className={style.button}
        >
          <ConnectorPointerIcon iconName={type} />
        </UiButton>
      ))}
    </>
  );
}
