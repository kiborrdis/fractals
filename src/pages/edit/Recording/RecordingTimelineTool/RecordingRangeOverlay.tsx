import { useGraphEditContext } from "@/shared/ui/GraphEdit/context";
import {
  toCanvasPixels,
  toCanvasSpace,
} from "@/shared/ui/GraphEdit/coordinateUtils";
import { useMemo } from "react";
import styles from "./RecordingRangeOverlay.module.css";

export const RecordingRangeOverlay = ({
  startTime,
  endTime,
  period,
}: {
  startTime: number;
  endTime: number;
  period: number;
}) => {
  const { offset, axisRangeSizes, size, options } = useGraphEditContext();

  // Calculate normalized positions and loop count
  const { loopCount, normalizedStart, normalizedEnd } = useMemo(() => {
    if (period <= 0) {
      return { loopCount: 0, normalizedStart: 0, normalizedEnd: 0 };
    }

    const duration = endTime - startTime;
    const loopCount = Math.floor(duration / period);
    const normalizedStart = ((startTime % period) + period) % period;
    const normalizedEnd = (((startTime + duration) % period) + period) % period;

    return { loopCount, normalizedStart, normalizedEnd };
  }, [startTime, endTime, period]);

  // Calculate pixel positions for start and end markers
  const { startPos, endPos } = useMemo(() => {
    const canvasCoordsStart = toCanvasSpace(
      [normalizedStart, 0],
      axisRangeSizes,
      offset,
    );
    const canvasCoordsEnd = toCanvasSpace(
      [normalizedEnd, 0],
      axisRangeSizes,
      offset,
    );

    const [pixelXStart] = toCanvasPixels(canvasCoordsStart, size, options);
    const [pixelXEnd] = toCanvasPixels(canvasCoordsEnd, size, options);

    return {
      startPos: pixelXStart,
      endPos: pixelXEnd,
    };
  }, [normalizedStart, normalizedEnd, axisRangeSizes, offset, size, options]);

  const coversFullPeriod = loopCount >= 1;
  const wrapsAround = !coversFullPeriod && normalizedEnd < normalizedStart;

  return (
    <>
      {coversFullPeriod ? (
        <div className={styles.coverageOverlayFull} />
      ) : wrapsAround ? (
        <>
          <div
            className={styles.coverageOverlay}
            style={{
              left: `${startPos}px`,
              width: `${size[0] - startPos}px`,
            }}
          />
          <div
            className={styles.coverageOverlay}
            style={{
              left: 0,
              width: `${endPos}px`,
            }}
          />
        </>
      ) : (
        <div
          className={styles.coverageOverlay}
          style={{
            left: `${startPos}px`,
            width: `${endPos - startPos}px`,
          }}
        />
      )}

      <div className={styles.startLine} style={{ left: `${startPos}px` }} />

      <div className={styles.endLine} style={{ left: `${endPos}px` }} />

      <div className={styles.startLabel} style={{ left: `${startPos + 4}px` }}>
        Start: {(startTime / 1000).toFixed(1)}s
      </div>

      <div className={styles.endLabel} style={{ left: `${endPos + 4}px` }}>
        End: {(endTime / 1000).toFixed(1)}s
        {loopCount > 0 && ` (${loopCount}+ loops)`}
      </div>
    </>
  );
};
