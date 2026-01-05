import { Vector2 } from "@/shared/libs/vectors";
import { useGraphEditContext, useGraphEditRegisterHandler } from "./context";
import { useThrottledCallback } from "@mantine/hooks";
import { fromCanvasPixels, toValueSpace } from "./coordinateUtils";
import { MouseEvent, useEffect, useRef } from "react";

export const GraphValueHover = ({
  onHover,
  onClick,
  priority,
}: {
  onHover: (value: Vector2 | null) => void;
  onClick?: (value: Vector2) => void;
  priority?: number;
}) => {
  const { offset, axisRangeSizes, size, options, getBoundPos } =
    useGraphEditContext();
  const handleMouseMove = useThrottledCallback((e: MouseEvent) => {
    const bound = getBoundPos();

    const [x, y] = fromCanvasPixels(
      [e.clientX - bound[0], e.clientY - bound[1]],
      size,
      options,
    );

    const vec = toValueSpace([x, y], axisRangeSizes, offset);

    onHover(vec);
  }, 25);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const timeoutRef = useRef<any | null>(null);
  useEffect(
    () => () =>
      timeoutRef.current ? clearTimeout(timeoutRef.current) : undefined,
    [],
  );
  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      onHover(null);
    }, 30);
  };

  const handleClick = (e: MouseEvent) => {
    const bound = getBoundPos();

    const [x, y] = fromCanvasPixels(
      [e.clientX - bound[0], e.clientY - bound[1]],
      size,
      options,
    );

    const vec = toValueSpace([x, y], axisRangeSizes, offset);

    onClick?.(vec);
  };

  useGraphEditRegisterHandler(
    {
      move: handleMouseMove,
      click: handleClick,
      mouseLeave: handleMouseLeave,
    },
    priority,
  );

  return null;
};
