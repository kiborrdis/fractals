import { useDrag } from "@/shared/hooks/useDrag";
import { Vector2 } from "@/shared/libs/vectors";
import { useElementSize } from "@mantine/hooks";
import { useEffect } from "react";
import styles from "./PreviewStateOverlay.module.css";

const MIN_SCALE = 0.1;
const MAX_SCALE = 2;

export const PreviewStateOverlay = ({
  width,
  height,
  scale,
  offset,
  onSizeChange,
  onBackgroundScaleChange,
}: {
  width: number;
  height: number;

  scale: number;
  offset: Vector2;
  onSizeChange?: (newOffset: Vector2, newScale: number) => void;
  onBackgroundScaleChange?: (newBackgroundScale: number) => void;
}) => {
  const { height: containerHeight, width: realWidth, ref } = useElementSize();
  const aspectRatio = width / height;
  const containerWidth = containerHeight * aspectRatio;
  const backgroundScale = containerWidth / realWidth;

  useEffect(() => {
    onBackgroundScaleChange?.(backgroundScale);
  }, [backgroundScale, onBackgroundScaleChange]);

  const { elementHandlers } = useDrag({
    canStartDrag: true,
    onDragMove: (_, delta) => {
      const newOffset: Vector2 = [
        offset[0] + delta[0] * backgroundScale * (width / containerWidth),
        offset[1] + delta[1] * backgroundScale * (height / containerHeight),
      ];

      onSizeChange?.(newOffset, scale);
    },
  });

  const { elementHandlers: topHandlers } = useDrag({
    canStartDrag: true,
    onDragMove: (_, delta) => {
      const scaleDelta = -delta[1] / (containerHeight / 2);
      const newScale = Math.max(
        MIN_SCALE,
        Math.min(MAX_SCALE, scale + scaleDelta),
      );
      onSizeChange?.(offset, newScale);
    },
  });

  const { elementHandlers: rightHandlers } = useDrag({
    canStartDrag: true,
    onDragMove: (_, delta) => {
      const scaleDelta = delta[0] / (containerWidth / 2);
      const newScale = Math.max(
        MIN_SCALE,
        Math.min(MAX_SCALE, scale + scaleDelta),
      );
      onSizeChange?.(offset, newScale);
    },
  });

  const { elementHandlers: bottomHandlers } = useDrag({
    canStartDrag: true,
    onDragMove: (_, delta) => {
      const scaleDelta = delta[1] / (containerHeight / 2);
      const newScale = Math.max(
        MIN_SCALE,
        Math.min(MAX_SCALE, scale + scaleDelta),
      );
      onSizeChange?.(offset, newScale);
    },
  });

  const { elementHandlers: leftHandlers } = useDrag({
    canStartDrag: true,
    onDragMove: (_, delta) => {
      const scaleDelta = -delta[0] / (containerWidth / 2);
      const newScale = Math.max(
        MIN_SCALE,
        Math.min(MAX_SCALE, scale + scaleDelta),
      );
      onSizeChange?.(offset, newScale);
    },
  });

  return (
    <div className={styles.container} ref={ref}>
      <div
        {...elementHandlers}
        className={styles.renderArea}
        style={{
          left: `calc(50% + ${(offset[0] / backgroundScale) * (containerWidth / width)}px)`,
          top: `calc(50% + ${(offset[1] / backgroundScale) * (containerHeight / height)}px)`,
          aspectRatio: `${width} / ${height}`,
          transform: `translate(-50%, -50%) scale(${scale / backgroundScale})`,
        }}
      >
        <div className={styles.dimensionsLabel}>
          {width} × {height}
        </div>

        <div
          {...topHandlers}
          className={`${styles.edgeHandle} ${styles.topEdge}`}
        />
        <div
          {...rightHandlers}
          className={`${styles.edgeHandle} ${styles.rightEdge}`}
        />
        <div
          {...bottomHandlers}
          className={`${styles.edgeHandle} ${styles.bottomEdge}`}
        />
        <div
          {...leftHandlers}
          className={`${styles.edgeHandle} ${styles.leftEdge}`}
        />
      </div>
    </div>
  );
};
