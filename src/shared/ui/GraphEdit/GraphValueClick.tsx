import { Vector2 } from "@/shared/libs/vectors";
import { useGraphEditContext, useGraphEditRegisterHandler } from "./context";
import { useThrottledCallback } from "@mantine/hooks";
import { fromCanvasPixels, toValueSpace } from "./coordinateUtils";
import { MouseEvent } from "react";

export const GraphValueClick = ({
  onClick,
  priority,
}: {
  onClick: (value: Vector2) => void;
  priority?: number;
}) => {
  const { offset, axisRangeSizes, size, options, getBoundPos } =
    useGraphEditContext();
  const handleClick = useThrottledCallback((e: MouseEvent) => {
    const bound = getBoundPos();

    const [x, y] = fromCanvasPixels(
      [e.clientX - bound[0], e.clientY - bound[1]],
      size,
      options,
    );

    const vec = toValueSpace([x, y], axisRangeSizes, offset);

    onClick(vec);
  }, 25);

  useGraphEditRegisterHandler(
    {
      click: handleClick,
    },
    priority,
  );

  return null;
};
