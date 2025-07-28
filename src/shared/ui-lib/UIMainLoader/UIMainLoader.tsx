import React from "react";
import styles from "./UIMainLoader.module.css";

export const UIMainLoader = (): React.JSX.Element => {
  return (
    <div className={styles.animateLogo}>
      <img src="/loader.svg" alt="Loading..." className={styles.icon} />
    </div>
  );
};
