import React from "react";
import styles from "./Link.module.css";
import { Link as RRDLink } from "react-router-dom";
import clsx from "clsx";

interface Props
  extends React.PropsWithChildren<
    React.AnchorHTMLAttributes<HTMLAnchorElement>
  > {
  to: string;
}

export const Link: React.FC<Props> = ({ children, className, ...props }) => {
  return (
    <RRDLink {...props} className={clsx(styles.link, className)}>
      {children}
    </RRDLink>
  );
};
