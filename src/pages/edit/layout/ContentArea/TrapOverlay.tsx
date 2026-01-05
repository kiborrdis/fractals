import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FractalTrap } from "@/features/fractals";
import { Graph2DCircle } from "@/shared/ui/GraphEdit/Graph2DLine";
import {
  Graph2DLine,
  PointsEdit,
  useGraphEditContext,
} from "@/shared/ui/GraphEdit";
import {
  fromCanvasPixels,
  toValueSpace,
} from "@/shared/ui/GraphEdit/coordinateUtils";
import { Vector2 } from "@/shared/libs/vectors";

const TRAP_COLOR = "rgba(255, 255, 255, 0.8)";

function useViewportBounds(): {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
} {
  const { size, axisRangeSizes, offset, options } = useGraphEditContext();
  const topLeft = toValueSpace(
    fromCanvasPixels([0, 0], size, options),
    axisRangeSizes,
    offset,
  );
  const bottomRight = toValueSpace(
    fromCanvasPixels(size, size, options),
    axisRangeSizes,
    offset,
  );
  return {
    xMin: topLeft[0],
    xMax: bottomRight[0],
    yMin: topLeft[1],
    yMax: bottomRight[1],
  };
}

function getLineVisibleSegment(
  trap: { a: number; b: number; c: number },
  bounds: { xMin: number; xMax: number; yMin: number; yMax: number },
): [Vector2, Vector2] | null {
  const { a, b, c } = trap;
  const { xMin, xMax, yMin, yMax } = bounds;

  const points: Vector2[] = [];
  if (Math.abs(b) > 1e-10) {
    const y1 = -(a * xMin + c) / b;
    if (y1 >= yMin && y1 <= yMax) points.push([xMin, y1]);
    const y2 = -(a * xMax + c) / b;
    if (y2 >= yMin && y2 <= yMax) points.push([xMax, y2]);
  }
  if (Math.abs(a) > 1e-10) {
    const x1 = -(b * yMin + c) / a;
    if (x1 >= xMin && x1 <= xMax) points.push([x1, yMin]);
    const x2 = -(b * yMax + c) / a;
    if (x2 >= xMin && x2 <= xMax) points.push([x2, yMax]);
  }

  if (points.length < 2) return null;
  return [points[0], points[points.length - 1]];
}

const CircleTrapEdit = memo(
  ({
    trap,
    index,
    onTrapUpdate,
  }: {
    trap: Extract<FractalTrap, { type: "circle" }>;
    index: number;
    onTrapUpdate: (i: number, t: FractalTrap) => void;
  }) => {
    const resizeHandle: Vector2 = [
      trap.center[0] + trap.radius,
      trap.center[1],
    ];

    return (
      <>
        <Graph2DCircle
          center={trap.center}
          radius={trap.radius}
          color={TRAP_COLOR}
        />
        <PointsEdit
          points={[trap.center, resizeHandle]}
          onPointMove={(i, newPos) => {
            if (i === 0) {
              onTrapUpdate(index, { ...trap, center: newPos });
            } else {
              const newRadius = Math.abs(newPos[0] - trap.center[0]);
              onTrapUpdate(index, {
                ...trap,
                radius: Math.max(0.001, newRadius),
              });
            }
          }}
        />
      </>
    );
  },
);
CircleTrapEdit.displayName = "CircleTrapEdit";

function segmentCenter(seg: [Vector2, Vector2]): Vector2 {
  return [(seg[0][0] + seg[1][0]) / 2, (seg[0][1] + seg[1][1]) / 2];
}

const colorFn = () => TRAP_COLOR;

const LineTrapEdit = ({
  trap,
  index,
  onTrapUpdate,
}: {
  trap: Extract<FractalTrap, { type: "line" }>;
  index: number;
  onTrapUpdate: (i: number, t: FractalTrap) => void;
}) => {
  const [rotating, setRotating] = useState(false);
  const bounds = useViewportBounds();
  const { axisRangeSizes } = useGraphEditContext();
  const segment = useMemo(() => {
    return getLineVisibleSegment(trap, {
      xMax: bounds.xMax,
      xMin: bounds.xMin,
      yMax: bounds.yMax,
      yMin: bounds.yMin,
    });
  }, [bounds.xMax, bounds.xMin, bounds.yMax, bounds.yMin, trap]);

  const trapRef = useRef(trap);
  trapRef.current = trap;

  const [center, setCenter] = useState<Vector2 | null>(() =>
    segment ? segmentCenter(segment) : null,
  );

  const { xMin, xMax, yMin, yMax } = bounds;
  useEffect(() => {
    const seg = getLineVisibleSegment(trapRef.current, {
      xMin,
      xMax,
      yMin,
      yMax,
    });
    if (seg) {
      setCenter(segmentCenter(seg));
    }
  }, [xMin, xMax, yMin, yMax]);

  const handlePointMove = useCallback(
    (i: number, newPos: Vector2) => {
      if (!center) {
        return;
      }

      if (i === 0) {
        setCenter(newPos);
        onTrapUpdate(index, {
          ...trapRef.current,
          c: -(trapRef.current.a * newPos[0] + trapRef.current.b * newPos[1]),
        });
      } else {
        const dx = newPos[0] - center[0];
        const dy = newPos[1] - center[1];
        const len = Math.hypot(dx, dy);
        if (len < 0.00001) {
          return;
        }
        const a = -dy / len;
        const b = dx / len;
        onTrapUpdate(index, {
          ...trapRef.current,
          a,
          b,
          c: -(a * center[0] + b * center[1]),
        });
      }
    },
    [center, index, onTrapUpdate],
  );

  if (!segment || !center) return null;

  const handleDist = Math.min(axisRangeSizes[0], axisRangeSizes[1]) * 0.15;
  const dirLen = Math.hypot(trap.b, trap.a);
  const rotationHandle: Vector2 = [
    center[0] + (trap.b / dirLen) * handleDist,
    center[1] + (-trap.a / dirLen) * handleDist,
  ];

  return (
    <>
      <Graph2DLine lineWidth={2} data={segment} getColor={colorFn} />
      {rotating && (
        <Graph2DCircle
          center={center}
          lineWidth={1.2}
          lineDash={10}
          radius={handleDist}
          color={TRAP_COLOR}
        />
      )}
      <PointsEdit
        points={[center, rotationHandle]}
        onPointMoveStart={(i) => {
          if (i === 1) {
            setRotating(true);
          }
        }}
        onPointMoveEnd={(i) => {
          if (i === 1) {
            setRotating(false);
          }
        }}
        onPointMove={handlePointMove}
      />
    </>
  );
};

export const TrapOverlay = ({
  traps,
  onTrapUpdate,
}: {
  traps: FractalTrap[];
  onTrapUpdate: (index: number, trap: FractalTrap) => void;
}) => {
  return (
    <>
      {traps.map((trap, i) => {
        if (trap.type === "circle") {
          return (
            <CircleTrapEdit
              key={i}
              trap={trap}
              index={i}
              onTrapUpdate={onTrapUpdate}
            />
          );
        }
        if (trap.type === "line") {
          return (
            <LineTrapEdit
              key={i}
              trap={trap}
              index={i}
              onTrapUpdate={onTrapUpdate}
            />
          );
        }
        return null;
      })}
    </>
  );
};
