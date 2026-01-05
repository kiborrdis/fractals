import { useGraphEditContext } from "@/shared/ui/GraphEdit/context";
import {
  toCanvasPixels,
  toCanvasSpace,
} from "@/shared/ui/GraphEdit/coordinateUtils";
import styles from "./TimelineStepRanges.module.css";

type StepRange = {
  start: number;
  end: number;
  index: number;
  selected: boolean;
};

export const TimelineStepRanges = ({
  ranges,
  onRangeClick,
}: {
  ranges: StepRange[];
  onRangeClick: (index: number) => void;
}) => {
  const { offset, axisRangeSizes, size, options } = useGraphEditContext();

  return (
    <>
      {ranges.map((range) => {
        const startCoords = toCanvasSpace(
          [range.start, 0],
          axisRangeSizes,
          offset,
        );
        const endCoords = toCanvasSpace([range.end, 0], axisRangeSizes, offset);
        const [startPixelX] = toCanvasPixels(startCoords, size, options);
        const [endPixelX] = toCanvasPixels(endCoords, size, options);

        const width = endPixelX - startPixelX;

        if (endPixelX < 0 || startPixelX > size[0]) {
          return null;
        }

        return (
          <div
            key={range.index}
            onClick={() => onRangeClick(range.index)}
            className={`${styles.stepRange} ${
              range.selected
                ? styles.stepRangeSelected
                : styles.stepRangeUnselected
            }`}
            style={{
              left: Math.max(0, startPixelX),
              width: Math.min(size[0], endPixelX) - Math.max(0, startPixelX),
              height: size[1],
              borderRight:
                width > 1 ? "1px solid rgba(255, 255, 255, 0.2)" : "none",
            }}
          />
        );
      })}
    </>
  );
};
