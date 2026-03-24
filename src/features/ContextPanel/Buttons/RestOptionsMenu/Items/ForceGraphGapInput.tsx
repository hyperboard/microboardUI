import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "features/AppContext";
import inputStyle from "./ForceGraphGapInput.module.css";

export function ForceGraphGapInput(): React.JSX.Element | null {
  const { board } = useAppContext();
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = board.selection.list();
  if (selected.length !== 1) return null;

  const nodeId = selected[0].getId();
  if (!board.isNodeInForceGraph(nodeId)) return null;

  const currentGap = board.getForceGraphGap(nodeId) ?? 100;
  const [value, setValue] = useState(() => Math.round(currentGap));

  useEffect(() => {
    setValue(Math.round(board.getForceGraphGap(nodeId) ?? 100));
  }, [nodeId]);

  const commit = (raw: string): void => {
    const n = parseInt(raw, 10);
    if (!isNaN(n) && n >= 10 && n <= 2000) {
      board.setForceGraphGap(nodeId, n);
      setValue(n);
    } else {
      setValue(Math.round(board.getForceGraphGap(nodeId) ?? 100));
    }
  };

  return (
    <div className={inputStyle.row}>
      <span className={inputStyle.label}>
        {t("contextPanel.forceGraph.gap")}
      </span>
      <input
        ref={inputRef}
        className={inputStyle.input}
        type="number"
        min={10}
        max={2000}
        step={10}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => {
          e.stopPropagation();
          if (e.key === "Enter") commit((e.target as HTMLInputElement).value);
        }}
        onClick={(e) => e.stopPropagation()}
      />
      <span className={inputStyle.unit}>px</span>
    </div>
  );
}
