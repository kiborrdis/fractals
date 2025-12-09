import { useMemo } from "react";
import { useMove } from "@mantine/hooks";
import styles from "./GradientLine.module.css";

type GradientStop = [
  iteration: number,
  r: number,
  g: number,
  b: number,
  a: number,
];

export const GradientLine = ({
  gradient,
  maxIterations,
  currentIteration,
  minValue,
  maxValue,
  onChange,
}: {
  gradient: GradientStop[];
  maxIterations: number;
  currentIteration?: number;
  minValue?: number;
  maxValue?: number;
  onChange?: (value: number) => void;
}) => {
  const gradientCss = useMemo(() => {
    const stops = gradient
      .map((stop) => {
        const [iteration, r, g, b, a] = stop;
        const percentage = (iteration / maxIterations) * 100;
        const color = `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`;
        return `${color} ${percentage}%`;
      })
      .join(", ");
    return `linear-gradient(to right, ${stops})`;
  }, [gradient, maxIterations]);

  const min = minValue ?? 0;
  const max = maxValue ?? maxIterations;

  const { ref, active } = useMove(({ x }) => {
    if (onChange) {
      const value = min + x * (max - min);
      onChange(value);
    }
  });

  return (
    <div
      className={`${styles.container} ${onChange ? styles.draggable : ""} ${active ? styles.dragging : ""}`}
      ref={ref}
    >
      <div
        className={`${styles.gradientLine}`}
        style={{ background: gradientCss }}
      />
      <div className={styles.indicators}>
        {gradient.map((stop, index) => {
          const [iteration] = stop;
          const percentage = (iteration / maxIterations) * 100;
          return (
            <div
              key={index}
              className={styles.indicator}
              style={{ left: `${percentage}%` }}
            >
              <div className={styles.tick} />
              <div className={styles.label}>{iteration}</div>
            </div>
          );
        })}
        {currentIteration !== undefined && (
          <div
            className={styles.currentIndicator}
            style={{ left: `${(currentIteration / maxIterations) * 100}%` }}
          >
            <div className={styles.currentLabel}>
              {Math.round(currentIteration)}
            </div>
            <div className={styles.currentTick} />
          </div>
        )}
      </div>
    </div>
  );
};
