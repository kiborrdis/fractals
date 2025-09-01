import { useEffect, useRef } from "react";
import { render } from "./render";

export interface HighlightedRange {
  start: number;
  end: number;
  color?: string;
  label?: string;
  rangeId?: string;
}

export const Graph = ({ 
  data, 
  height = 200,
  width = 200,
  cursorX, 
  dataOffset, 
  max,
  zoomLevel = 1,
  highlightedRanges = [],
  onRangeClick
}: {
  data: [number[], string][];
  max: number;
  height?: number;
  width?: number;
  cursorX?: number | null;
  dataOffset?: number;
  zoomLevel?: number;
  highlightedRanges?: Array<HighlightedRange>;
  onRangeClick?: (rangeId: string) => void;
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
        zoomLevel
      });
    }
  }, [data, dataOffset, max, height, zoomLevel, width]);

  // Calculate highlighted ranges styles
  const getHighlightedRangesStyles = () => {
    if (!highlightedRanges.length || !data.length) return [];
    
    const effectiveWidth = Math.floor(width / zoomLevel);
    const startIndex = Math.max(0, data.length - effectiveWidth + (dataOffset || 0));
    
    return highlightedRanges.map((range, index) => {
      const pixelStart = (range.start - startIndex) * zoomLevel;
      const pixelEnd = (range.end - startIndex) * zoomLevel;
      
      // Only show if range is visible in current view
      if (pixelEnd < 0 || pixelStart > width) return null;
      
      const drawStart = Math.max(0, pixelStart);
      const drawEnd = Math.min(width, pixelEnd);
      
      return {
        key: `highlight-${index}`,
        style: {
          left: `${drawStart}px`,
          width: `${drawEnd - drawStart}px`,
          height: `${height}px`,
        },
        color: range.color || 'rgba(255, 255, 0, 0.3)', // Default yellow highlight
        label: range.label,
        rangeId: range.rangeId
      };
    }).filter(Boolean);
  };

  const highlightedRangesStyles = getHighlightedRangesStyles();

  return (
    <div style={{ position: 'relative', width: `${width}px`, height: `${height}px` }}>
      <canvas
        ref={ref}
        style={{
          width: width,
          height: `${height}px`,
          cursor: "crosshair",
          touchAction: "none",
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      />
      
      {/* Highlighted ranges */}
      {highlightedRangesStyles.map((highlightStyle) => highlightStyle && (
        <div
          key={highlightStyle.key}
          style={{
            position: 'absolute',
            top: 0,
            backgroundColor: highlightStyle.color,
            pointerEvents: highlightStyle.rangeId && onRangeClick ? 'auto' : 'none',
            cursor: highlightStyle.rangeId && onRangeClick ? 'pointer' : 'default',
            zIndex: 1,
            ...highlightStyle.style,
          }}
          onClick={highlightStyle.rangeId && onRangeClick ? () => onRangeClick(highlightStyle.rangeId!) : undefined}
        >
          {highlightStyle.label && (
            <div
              style={{
                position: 'absolute',
                top: '2px',
                left: '2px',
                fontSize: '10px',
                color: 'white',
                backgroundColor: 'rgba(0,0,0,0.7)',
                padding: '1px 3px',
                borderRadius: '2px',
                whiteSpace: 'nowrap',
              }}
            >
              {highlightStyle.label}
            </div>
          )}
        </div>
      ))}
      
      {/* Cursor line */}
      {cursorX !== null && cursorX !== undefined && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: `${cursorX}px`,
            width: '1px',
            height: `${height}px`,
            backgroundColor: 'white',
            opacity: 0.8,
            pointerEvents: 'none',
            borderLeft: '1px dashed white',
          }}
        />
      )}
    </div>
  );
};
