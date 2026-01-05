import styles from "./DefaultPoint.module.css";

export const DefaultPoint = () => {
  return (
    <div className={styles.defaultPointOuter}>
      <div className={styles.defaultPointInner} />
    </div>
  );
};
