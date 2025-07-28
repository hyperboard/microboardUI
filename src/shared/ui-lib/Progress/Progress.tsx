import React, { useEffect, useState } from "react";
import styles from "./Progress.module.css";
import clsx from "clsx";

interface IProgressBar {
  width: number;
  classnames?: string;
}

export const ProgressBar = ({
  width,
  classnames,
  ...props
}: IProgressBar): React.JSX.Element => {
  const [style, setStyle] = useState({});

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const newStyle = {
        opacity: 1,
        width: `${width}%`,
      };

      setStyle(newStyle);
    }, 50);

    return () => clearTimeout(timeoutId);
  });

  return (
    <div className={clsx(styles.progress, classnames)} {...props}>
      <div className={styles.progressDone} style={style}></div>
    </div>
  );
};
