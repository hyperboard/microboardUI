import React from "react";
import styles from "./Watermark.module.css";

export function Watermark() {
  return (
    <a
      href="https://microboard.io"
      target="_blank"
      rel="noopener noreferrer"
      className={styles.watermark}
    >
      <svg
        width="140"
        height="38"
        viewBox="0 0 140 38"
        className={styles.watermarkSvg}
      >
        <text
          x="70"
          y="16"
          textAnchor="middle"
          className={styles.watermarkText}
        >
          Powered by
        </text>
        <text
          x="70"
          y="30"
          textAnchor="middle"
          className={styles.watermarkText}
        >
          Microboard
        </text>
      </svg>
    </a>
  );
}
