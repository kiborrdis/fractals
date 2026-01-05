import { MouseEvent, useState } from "react";
import { Vector2 } from "@/shared/libs/vectors";
import { GraphValueHover, PointsEdit } from "@/shared/ui/GraphEdit";
import { useGraphEditRegisterHandler } from "@/shared/ui/GraphEdit/context";
import { CrossPoint } from "@/shared/ui/Points/CrossPoint";

export const AddPointHover = ({
  data,
  mode,
  onAddStep,
  onHover,
  onHoverLeave,
  priority,
}: {
  data: Vector2[];
  mode: "view" | "addPoint";
  onAddStep: (dataIndex: number) => void;
  onHover?: (valueSpaceCoord: Vector2) => void;
  onHoverLeave?: () => void;
  priority?: number;
}) => {
  const [pointIndex, setPointIndex] = useState<number | null>(null);

  const handleHover = (vec: Vector2 | null) => {
    if (vec === null) {
      onHoverLeave?.();
      setPointIndex(null);
      return;
    }

    const [, closestPointIndex]: [number, number] = data.reduce(
      (m, p, i) => {
        const dist = Math.pow(vec[0] - p[0], 2) + Math.pow(vec[1] - p[1], 2);

        if (dist < m[0]) {
          return [dist, i];
        }

        return m;
      },
      [0.4, -1],
    );

    if (closestPointIndex === -1) {
      setPointIndex(null);
    } else {
      setPointIndex(closestPointIndex);
    }

    onHover?.(vec);
  };

  const handleMouseDown = (e: MouseEvent) => {
    if (mode === "addPoint" && pointIndex !== null) {
      e.stopPropagation();
      onAddStep(pointIndex);
      setPointIndex(null);
    }
  };

  useGraphEditRegisterHandler(
    {
      mouseDown: handleMouseDown,
    },
    priority,
  );

  const addPointData =
    pointIndex !== null && mode === "addPoint" ? [data[pointIndex]] : [];

  return (
    <>
      <GraphValueHover onHover={handleHover} priority={priority} />
      <PointsEdit points={addPointData} renderPoint={() => <CrossPoint />} />
    </>
  );
};
