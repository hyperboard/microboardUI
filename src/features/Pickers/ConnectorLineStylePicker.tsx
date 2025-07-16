import { ConnectorLineStyle } from "microboard-temp";
import { ConnectorIcon } from "shared/ui-lib/Icon";
import React from "react";
import { UiButton } from "shared/ui-lib/UiButton";

type Props = {
  onPick: (type: ConnectorLineStyle) => void;
  selected?: string;
};

export function ConnectorLineStylePicker({
  onPick,
  selected,
}: Props): React.ReactElement {
  const handleStraightPick = (): void => {
    onPick("straight");
  };
  const handleCurvedPick = (): void => {
    onPick("curved");
  };
  const handleOrthogonalPick = (): void => {
    onPick("orthogonal");
  };
  return (
    <>
      <UiButton
        id={"connector-straight"}
        onClick={handleStraightPick}
        active={selected === "straight"}
        variant="secondary"
      >
        <ConnectorIcon iconName="straight" />
      </UiButton>
      <UiButton
        id={"connector-curved"}
        onClick={handleCurvedPick}
        active={selected === "curved"}
        variant="secondary"
      >
        <ConnectorIcon iconName="curved" />
      </UiButton>
      <UiButton
        id={"connector-orthogonal"}
        onClick={handleOrthogonalPick}
        active={selected === "orthogonal"}
        variant="secondary"
      >
        <ConnectorIcon iconName="orthogonal" />
      </UiButton>
    </>
  );
}
