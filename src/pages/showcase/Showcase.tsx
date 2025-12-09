import { FractalParamsBuildRules } from "@/features/fractals";
import { defaultParse } from "@/shared/hooks/useQueryPersistense";
import { DisplayFractals } from "./DisplayFractals";
import { fractals } from "./fractalStrings";
import { HeroOverlay } from "./HeroOverlay";
import styles from "./Showcase.module.css";
import { useEffect, useRef, useState } from "react";
import SecondScreen from "./SecondScreen";

export const Showcase = () => {
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

  return (
    <div>
      <div className={styles.showcaseContainer} ref={containerRef}>
        <DisplayFractals
          play={play}
          fractals={toGrid(
            fractals.map((f) => defaultParse(f) as FractalParamsBuildRules),
            rows,
            cols,
          )}
        />
        <BoxShadowGrid rows={rows} cols={cols} />
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
