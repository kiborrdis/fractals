import { useDrag } from "@/shared/hooks/useDrag";
import { useRef } from "react";

export interface HighlightedRange {
  start: number;
  end: number;
  color?: string;
  label?: string;
  rangeId?: string;
}

export const HighlightedRangeItem = ({
  range,
  pixelStart,
  pixelEnd,
  width,
  height,
  onRangeClick,
  onRangeResize,
}: {
  range: HighlightedRange;
  pixelStart: number;
  pixelEnd: number;
  width: number;
  height: number;
  onRangeResize?: (newWidth: number) => void;
  onRangeClick?: (rangeId: string) => void;
}) => {
  const leftRef = useRef<number>(0);

  const { elementHandlers } = useDrag({
    canStartDrag: !!onRangeResize,
    onDragMove: (pos) => {
      if (onRangeResize) {
        onRangeResize(pos[0] - leftRef.current);
      }
    },
  });

  // Only show if range is visible in current view
  if (pixelEnd < 0 || pixelStart > width) return null;

  const drawStart = Math.max(0, pixelStart);
  const drawEnd = Math.min(width, pixelEnd);

  const style = {
    left: `${drawStart}px`,
    width: `${drawEnd - drawStart}px`,
    height: `${height}px`,
  };

  const color = range.color || "rgba(255, 255, 0, 0.3)"; // Default yellow highlight

  return (
    <div
      ref={(el) => {
        if (el) {
          leftRef.current = el.getBoundingClientRect().left;
        } else {
          leftRef.current = 0;
        }
      }}
      style={{
        position: "absolute" as const,
        top: 0,
        pointerEvents: onRangeResize || onRangeClick ? "auto" : "none",
        backgroundColor: color,
        cursor: range.rangeId && onRangeClick ? "pointer" : "default",
        zIndex: 1,
        ...style,
      }}
      onClick={
        range.rangeId && onRangeClick
          ? () => onRangeClick(range.rangeId!)
          : undefined
      }
    >
      {range.label && (
        <div
          style={{
            position: "absolute",
            top: "2px",
            left: "2px",
            fontSize: "10px",
            color: "white",
            backgroundColor: "rgba(0,0,0,0.7)",
            padding: "1px 3px",
            borderRadius: "2px",
            whiteSpace: "nowrap",
          }}
        >
          {range.label}
        </div>
      )}
      {onRangeResize && (
        <div
          {...elementHandlers}
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            width: 4,
            cursor: "ew-resize",
            zIndex: 4,
            backgroundColor: "rgba(255, 255, 255, 0.5)",
          }}
        />
      )}
    </div>
  );
};
