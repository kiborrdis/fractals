import styles from "./DimmedPoint.module.css";

export const DimmedPoint = () => {
  return (
    <div className={styles.dimmedPointOuter}>
      <div className={styles.dimmedPointInner} />
    </div>
  );
};
