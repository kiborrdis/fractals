import { MouseEvent, useState, useCallback } from "react";
import { Vector2 } from "@/shared/libs/vectors";
import { GraphValueHover, PointsEdit } from "@/shared/ui/GraphEdit";
import { useGraphEditRegisterHandler } from "@/shared/ui/GraphEdit/context";
import { CrossPoint } from "@/shared/ui/Points/CrossPoint";

export const AddPointHoverSpline = ({
  controlPoints,
  onAddStep,
  priority,
}: {
  controlPoints: Vector2[];
  onAddStep: (segmentIndex: number, point: Vector2) => void;
  priority?: number;
}) => {
  const [closestPoint, setClosestPoint] = useState<Vector2 | null>(null);
  const [closestSegmentIndex, setClosestSegmentIndex] = useState<number | null>(
    null,
  );

  const handleHover = useCallback(
    (vec: Vector2 | null) => {
      if (vec === null) {
        setClosestSegmentIndex(null);
        setClosestPoint(null);
        return;
      }

      const result = findClosestPointOnPolygon(vec, controlPoints);

      if (result === null) {
        setClosestSegmentIndex(null);
        setClosestPoint(null);
      } else {
        setClosestSegmentIndex(result.segmentIndex);
        setClosestPoint(result.point);
      }
    },
    [controlPoints],
  );

  const handleMouseDown = (e: MouseEvent) => {
    if (closestPoint && closestSegmentIndex !== null) {
      e.stopPropagation();
      onAddStep(closestSegmentIndex, closestPoint);
      setClosestSegmentIndex(null);
      setClosestPoint(null);
    }
  };

  useGraphEditRegisterHandler(
    {
      mouseDown: handleMouseDown,
    },
    priority,
  );

  const addPointData =
    closestSegmentIndex !== null && closestPoint ? [closestPoint] : [];

  return (
    <>
      <GraphValueHover onHover={handleHover} priority={priority} />
      <PointsEdit points={addPointData} renderPoint={() => <CrossPoint />} />
    </>
  );
};

/**
 * Find the closest point on the polygon formed by control points
 * Returns { point, segmentIndex } or null if no close point found
 */
function findClosestPointOnPolygon(
  hoverPoint: Vector2,
  controlPoints: Vector2[],
  threshold: number = 0.4,
): { point: Vector2; segmentIndex: number } | null {
  if (controlPoints.length < 2) {
    return null;
  }

  let minDist = threshold;
  let closestPoint: Vector2 | null = null;
  let closestSegmentIndex = -1;

  // Check distance to each segment of the polygon
  for (let i = 0; i < controlPoints.length; i++) {
    const a = controlPoints[i];
    const b = controlPoints[(i + 1) % controlPoints.length];
    const closest = closestPointOnSegment(hoverPoint, a, b);
    const dist = distanceSquared(hoverPoint, closest);

    if (dist < minDist) {
      minDist = dist;
      closestPoint = closest;
      closestSegmentIndex = i;
    }
  }

  return closestPoint !== null
    ? { point: closestPoint, segmentIndex: closestSegmentIndex }
    : null;
}

function closestPointOnSegment(p: Vector2, a: Vector2, b: Vector2): Vector2 {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const lenSq = dx * dx + dy * dy;

  if (lenSq === 0) {
    return a;
  }

  let t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));

  return [a[0] + t * dx, a[1] + t * dy];
}

function distanceSquared(p1: Vector2, p2: Vector2): number {
  const dx = p1[0] - p2[0];
  const dy = p1[1] - p2[1];
  return dx * dx + dy * dy;
}
