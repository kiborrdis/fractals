import styles from "./SelectedPoint.module.css";

export const SelectedPoint = () => {
  return (
    <div className={styles.selectedPointOuter}>
      <div className={styles.selectedPointInner} />
    </div>
  );
};
