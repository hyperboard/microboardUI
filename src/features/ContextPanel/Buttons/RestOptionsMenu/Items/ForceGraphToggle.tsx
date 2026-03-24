import React, { useEffect, useState } from "react";
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
  const nodeId = selected.length === 1 ? selected[0].getId() : null;

  // Hooks must always be called — no early returns before this
  const [isActive, setIsActive] = useState(() =>
    nodeId ? board.isNodeInForceGraph(nodeId) : false,
  );

  useEffect(() => {
    setIsActive(nodeId ? board.isNodeInForceGraph(nodeId) : false);
  }, [nodeId]);

  if (!nodeId) return null;

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
      icon={<Icon width={20} height={20} iconName={"Gear" as const} />}
    >
      {isActive
        ? t("contextPanel.forceGraph.stop")
        : t("contextPanel.forceGraph.start")}
    </RestOptionsMenuItem>
  );
}
