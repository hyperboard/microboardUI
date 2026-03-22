import {
  getHierarchyItemKind,
  getUnambiguousHierarchyPath,
} from "features/HierarchyNavigation/hierarchyUi";
import type { SelectionHierarchyNode } from "microboard-temp";
import React from "react";
import clsx from "clsx";
import { Icon, type IconId } from "shared/ui-lib/Icon";
import { UiPanel } from "shared/ui-lib/UiPanel";
import style from "./HierarchyBreadcrumbs.module.css";

interface HierarchyBreadcrumbsProps {
  path: SelectionHierarchyNode[][];
  left: number;
  top: number;
  onSelect: (ancestorId: string) => void;
}

function getKindIcon(itemType: string): IconId {
  const kind = getHierarchyItemKind(itemType);
  if (kind === "frame") {
    return "Frame";
  }
  if (kind === "group") {
    return "Stack";
  }
  return "Select";
}

export function HierarchyBreadcrumbs({
  path,
  left,
  top,
  onSelect,
}: HierarchyBreadcrumbsProps): React.ReactElement | null {
  const hierarchyPath = getUnambiguousHierarchyPath(path);

  if (!hierarchyPath || hierarchyPath.length === 0) {
    return null;
  }

  return (
    <UiPanel
      className={style.breadcrumbs}
      style={{ left, top: Math.max(8, top - 44) }}
      padding={0}
      zIndex={3}
      data-testid="hierarchy-breadcrumbs"
    >
      {hierarchyPath.map((node, index) => {
        const isCurrent = index === hierarchyPath.length - 1;
        const kind = getHierarchyItemKind(node.itemType);
        const icon = (
          <Icon
            iconName={getKindIcon(node.itemType)}
            width={12}
            height={12}
            className={clsx(style.kindIcon, {
              [style.kindGroup]: kind === "group",
              [style.kindFrame]: kind === "frame",
            })}
          />
        );

        return (
          <React.Fragment key={node.id}>
            {isCurrent ? (
              <span
                className={style.crumbCurrent}
                data-kind={kind}
                aria-current="page"
              >
                {icon}
                <span className={style.label}>{node.itemType}</span>
              </span>
            ) : (
              <button
                type="button"
                className={style.crumbButton}
                data-kind={kind}
                onClick={() => onSelect(node.id)}
              >
                {icon}
                <span className={style.label}>{node.itemType}</span>
              </button>
            )}
            {index < hierarchyPath.length - 1 && (
              <Icon
                iconName="ArrowRightSm"
                width={12}
                height={12}
                className={style.separator}
              />
            )}
          </React.Fragment>
        );
      })}
    </UiPanel>
  );
}
