import { useCallback } from "react";
import { clearWithColor } from "./render2D";
import { Vector2 } from "@/shared/libs/vectors";
import { useRegisterCanvasRender } from "./context";

export const GraphBackgroundColor = ({
  color,
  priority,
}: {
  color: string;
  priority?: number;
}) => {
  const render = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      {
        size,
      }: {
        size: Vector2;
      },
    ) => {
      clearWithColor(ctx, size, color);
    },
    [color],
  );

  useRegisterCanvasRender(render, priority);

  return null;
};
