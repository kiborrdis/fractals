import { CgClose } from "react-icons/cg";
import { DefaultPoint } from "./DefaultPoint";
import styles from "./HoverCrossPoint.module.css";

export const HoverCrossPoint = () => {
  return (
    <div className={styles.hoverCrossPoint}>
      <DefaultPoint />
      <CgClose size={16} className={styles.crossIcon} />
    </div>
  );
};
