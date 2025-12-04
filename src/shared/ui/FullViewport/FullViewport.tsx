import { ReactNode } from "react";
import styles from "./FullViewport.module.css";

export const FullViewport = ({ children }: { children: ReactNode }) => {
  return <div className={styles.root}>{children}</div>;
};
