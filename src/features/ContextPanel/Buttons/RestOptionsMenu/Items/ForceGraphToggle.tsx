import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "features/AppContext";
import { usePanelContext } from "features/ContextPanel/PanelContext";
import { RestOptionsMenuItem } from "../RestOptionsMenuItem";
import { Icon } from "shared/ui-lib/Icon";

export function ForceGraphToggle(): React.JSX.Element | null {
  const { board } = useAppContext();
  const { toggleMenu } = usePanelContext();
  const { t } = useTranslation();

  const selected = board.selection.list();
  if (selected.length !== 1) return null;

  const nodeId = selected[0].getId();
  const [isActive, setIsActive] = useState(() =>
    board.isNodeInForceGraph(nodeId),
  );

  useEffect(() => {
    setIsActive(board.isNodeInForceGraph(nodeId));
  }, [nodeId]);

  const handleClick = (): void => {
    if (isActive) {
      board.disableForceGraph(nodeId);
    } else {
      board.enableForceGraph(nodeId);
    }
    setIsActive(!isActive);
    toggleMenu("None");
  };

  return (
    <RestOptionsMenuItem
      id="force-graph-toggle"
      onClick={handleClick}
      icon={<Icon width={20} height={20} iconName="Graph" />}
    >
      {isActive
        ? t("contextPanel.forceGraph.stop")
        : t("contextPanel.forceGraph.start")}
    </RestOptionsMenuItem>
  );
}
