import { FaGithub } from "react-icons/fa";
import styles from "./HeroOverlay.module.css";

export const HeroOverlay = () => {
  return (
    <div className={styles.overlay}>
      <a
        href='https://github.com/kiborrdis/fractals'
        target='_blank'
        rel='noopener noreferrer'
        className={styles.githubLink}
        aria-label='View on GitHub'
      >
        <FaGithub className={styles.githubIcon} />
      </a>
      <div className={styles.content}>
        <h1 className={styles.title}>Fractals</h1>
        <div className={styles.divider} />
        <p className={styles.description}>
          Write mathematical formulas. Watch them come alive.
          <br />
          Real-time GPU-rendered fractal art with custom animations.
        </p>
        <div className={styles.buttons}>
          <a href='/edit' className={styles.primaryButton + ' ' + styles.editorButton}>
            Create Your Own
          </a>
          <p className={styles.description + ' ' +styles.usePCNote}>Use a Desktop or a Laptop to create your own</p>
        </div>
      </div>
    </div>
  );
};
