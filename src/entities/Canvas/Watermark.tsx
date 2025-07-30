import React from "react";
import styles from "./Watermark.module.css";

export function Watermark() {
  return (
    <a
      href="https://github.com/hyperboard/microboard"
      target="_blank"
      rel="noopener noreferrer"
      className={styles.watermark}
    >
      <svg
        width="200"
        height="50"
        viewBox="0 0 200 50"
        className={styles.watermarkSvg}
      >
        <defs>
          <linearGradient
            id="watermarkGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" style={{ stopColor: "#999", stopOpacity: 0.5 }} />
            <stop
              offset="100%"
              style={{ stopColor: "#666", stopOpacity: 0.7 }}
            />
          </linearGradient>
        </defs>
        <rect
          x="5"
          y="5"
          width="190"
          height="40"
          rx="8"
          fill="none"
          stroke="url(#watermarkGradient)"
          strokeWidth="1"
          className={styles.watermarkBorder}
        />
        <text
          x="100"
          y="22"
          textAnchor="middle"
          className={styles.watermarkText}
          fill="url(#watermarkGradient)"
        >
          Made with
        </text>
        <text
          x="100"
          y="38"
          textAnchor="middle"
          className={styles.watermarkText}
          fill="url(#watermarkGradient)"
        >
          Microboard
        </text>
      </svg>
    </a>
  );
}
