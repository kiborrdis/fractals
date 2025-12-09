import styles from "./HeroOverlay.module.css";

export const HeroOverlay = () => {
  return (
    <div className={styles.overlay}>
      <div className={styles.content}>
        <h1 className={styles.title}>Fractals</h1>
        <div className={styles.divider} />
        <p className={styles.description}>
          Write mathematical formulas. Watch them come alive.
          <br />
          Real-time GPU-rendered fractal art with custom animations.
        </p>
        <div className={styles.buttons}>
          <a href='/edit' className={styles.primaryButton}>
            Create Your Own
          </a>
        </div>
      </div>
    </div>
  );
};
