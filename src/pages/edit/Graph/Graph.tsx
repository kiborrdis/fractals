import { useEffect, useRef } from "react";
import { render } from "./render";
import { HighlightedRange, HighlightedRangeItem } from "./HighlightedRangeItem";

const calcPercent = (event: React.MouseEvent<HTMLElement>, width: number) => {
  const rect = event.currentTarget.getBoundingClientRect();
  const x = event.clientX - rect.left;
  return x / width;
};

export const Graph = ({
  data,
  height = 200,
  width = 200,
  cursorX,
  dataOffset,
  max,
  zoomLevel = 1,
  highlightedRanges = [],
  onRangeClick,
  onRangeResize,
  onMove,
  onMouseUp,
  onMouseDown,
  onMouseLeave,
  onClick,
}: {
  data: [number[], string][];
  max: number;
  height?: number;
  width?: number;
  cursorX?: number | null;
  dataOffset?: number;
  zoomLevel?: number;
  highlightedRanges?: Array<HighlightedRange>;
  onRangeResize?: (newWidth: number, rangeI: number, rangeId?: string) => void;
  onRangeClick?: (rangeId: string) => void;
  onMove?: (xPercent: number) => void;
  onMouseUp?: (xPercent: number) => void;
  onMouseDown?: (xPercent: number) => void;
  onMouseLeave?: () => void;
  onClick?: (xPercent: number) => void;
}) => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (ref.current) {
      render(ref.current, {
        data,
        max,
        width,
        height,
        dataOffset,
        zoomLevel,
      });
    }
  }, [data, dataOffset, max, height, zoomLevel, width]);

  // Calculate highlighted ranges pixel positions
  const getHighlightedRangePositions = () => {
    if (!highlightedRanges.length || !data.length) return [];

    const effectiveWidth = Math.floor(width / zoomLevel);
    const startIndex = Math.max(
      0,
      data.length - effectiveWidth + (dataOffset || 0)
    );

    return highlightedRanges.map((range, index) => {
      const pixelStart = (range.start - startIndex) * zoomLevel;
      const pixelEnd = (range.end - startIndex) * zoomLevel;
      return { range, index, pixelStart, pixelEnd };
    });
  };

  const rangePositions = getHighlightedRangePositions();

  return (
    <div
      style={{
        position: "relative",
        width: `${width}px`,
        height: `${height}px`,
      }}
    >
      <canvas
        ref={ref}
        style={{
          width: width,
          height: `${height}px`,
          cursor: "crosshair",
          touchAction: "none",
          position: "absolute",
          top: 0,
          left: 0,
        }}
        onMouseDown={(event: React.MouseEvent<HTMLCanvasElement>) => {
          if (onMouseDown) {
            onMouseDown(calcPercent(event, width));
          }
        }}
        onMouseUp={(event: React.MouseEvent<HTMLCanvasElement>) => {
          if (onMouseUp) {
            onMouseUp(calcPercent(event, width));
          }
        }}
        onClick={(event: React.MouseEvent<HTMLCanvasElement>) => {
          if (onClick) {
            onClick(calcPercent(event, width));
          }
        }}
      />      

      {/* Cursor line */}
      {cursorX !== null && cursorX !== undefined && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: `${cursorX}px`,
            width: "1px",
            height: `${height}px`,
            backgroundColor: "white",
            opacity: 0.8,
            pointerEvents: "none",
            borderLeft: "1px dashed white",
          }}
        />
      )}
    </div>
  );
};
