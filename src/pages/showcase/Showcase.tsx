import { DisplayFractals, FractalParamsBuildRules } from "@/features/fractals";
import { HeroOverlay } from "./HeroOverlay";
import styles from "./Showcase.module.css";
import { useEffect, useRef, useState } from "react";
import SecondScreen from "./SecondScreen";

export const Showcase = ({
  fractals,
}: {
  fractals: FractalParamsBuildRules[];
}) => {
  const rows = 4;
  const cols = 4;
  const [play, setPlay] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Stop playing when less than 50% is visible
        setPlay(entry.intersectionRatio >= 0.5);
      },
      {
        threshold: [0.5],
      },
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);
  const [showFractals, setShowFractals] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowFractals(true);
    }, 100); // Show fractals after 0.1 second

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div>
      <div className={styles.showcaseContainer} ref={containerRef}>
        {showFractals && (
          <DisplayFractals
            play={play}
            fractals={toGrid(
              fractals.length > rows * cols
                ? fractals.slice(0, rows * cols)
                : fractals,
              rows,
              cols,
            )}
          />
        )}
        {showFractals && <BoxShadowGrid rows={rows} cols={cols} />}
        {showFractals && <div className={styles.animateIn} />}
        <HeroOverlay />
      </div>
      <SecondScreen />
    </div>
  );
};

const toGrid = <E extends object>(
  elems: E[],
  rows: number,
  cols: number,
): E[][] => {
  const grid: E[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: E[] = [];
    for (let c = 0; c < cols; c++) {
      const index = (r * cols + c) % elems.length;
      if (index < elems.length) {
        row.push(elems[index]);
      }
    }
    grid.push(row);
  }

  return grid;
};

const BoxShadowGrid = ({ rows, cols }: { rows: number; cols: number }) => {
  return (
    <div className={styles.boxShadowGrid}>
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          className={styles.boxShadowRow}
          style={{ "--row-height": `${100 / rows}vh` } as React.CSSProperties}
        >
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className={styles.boxShadowCell} />
          ))}
        </div>
      ))}
    </div>
  );
};
