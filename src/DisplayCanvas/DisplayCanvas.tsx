import React, { useCallback, useEffect, useRef } from "react";
import styles from "./DisplayCanvas.module.css";

export const DisplayCanvas = React.memo(React.forwardRef(function (
  {
    width,
    height,
    onSizeChange,
  }: {
    width?: number;
    height?: number;
    onSizeChange?: (size: [number, number]) => void;
  },
  ref: React.Ref<HTMLCanvasElement>
) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const obs = new ResizeObserver((entries) => {
      if (containerRef.current) {
        const entry = entries[0];
        if (entry) {
          if (onSizeChange) {
            onSizeChange([entry.contentRect.width, entry.contentRect.height]);
          }
        }
      }
    });

    if (containerRef.current) {
      obs.observe(containerRef.current);
    }

    return () => {
      obs.disconnect();
    };
  }, [onSizeChange]);

  return (
    <div
      className={styles.backgroundCenter}
      ref={useCallback((el: HTMLDivElement | null) => {
        if (el) {
          onSizeChange?.([el.clientWidth, el.clientHeight]);
        }

        containerRef.current = el;
      }, [onSizeChange])}
    >
      <canvas
        ref={ref}
        style={{ width, height }}
        width={width}
        height={height}
      />
    </div>
  );
}));
DisplayCanvas.displayName = "DisplayCanvas";
