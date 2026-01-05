import { useDrag } from "@/shared/hooks/useDrag";
import { mul, sum, Vector2 } from "@/shared/libs/vectors";
import { fromCanvasPixels, toValueSpaceSize } from "./coordinateUtils";
import { useGraphEditContext, useGraphEditRegisterHandler } from "./context";

export const GraphViewportControls = ({
  zoomSensitivity = 0.05,
  priority,
  onPanToggle,
  onViewportChange,
}: {
  zoomSensitivity?: number;
  priority?: number;
  onPanToggle?: (isPanning: boolean) => void;
  onViewportChange: (rangs: Vector2, offset: Vector2) => void;
}) => {
  const { size, axisRangeSizes, offset, options, getBoundPos } =
    useGraphEditContext();
  const { elementHandlers } = useDrag({
    canStartDrag: true,
    onDragStart: () => {
      onPanToggle?.(true);
      return [offset, [0, 0] satisfies Vector2];
    },
    onDragMove: (_, delta, [initialOffset, accumulatedDelta]) => {
      const valueSpaceDelta: Vector2 = toValueSpaceSize(
        [delta[0] / size[0], delta[1] / size[1]],
        axisRangeSizes,
      );
      const newAccumDelta = sum(accumulatedDelta, valueSpaceDelta);

      onViewportChange(axisRangeSizes, sum(initialOffset, newAccumDelta));

      return [initialOffset, newAccumDelta];
    },
    onDragStop: () => {
      onPanToggle?.(false);
    },
  });

  const onWheel = (e: WheelEvent) => {
    e.preventDefault();
    const sign = Math.sign(e.deltaY);
    const bound = getBoundPos();
    const canvasPosition: Vector2 = fromCanvasPixels(
      [e.clientX - bound[0], e.clientY - bound[1]],
      size,
      options,
    );

    const newRangeSize = mul(
      axisRangeSizes,
      sign > 0 ? 1 + zoomSensitivity : 1 - zoomSensitivity,
    );
    const wholeSizeDelta = sum(axisRangeSizes, mul(-1, newRangeSize));
    const atTheEdgeSizeDelta = mul(wholeSizeDelta, 0.5);
    const distToCenter = mul(sum(canvasPosition, -0.5), 2);
    const newOffset = sum(
      offset,
      mul(mul(-1, atTheEdgeSizeDelta), distToCenter),
    );

    onViewportChange(newRangeSize, newOffset);
  };

  useGraphEditRegisterHandler(
    {
      mouseDown: elementHandlers.onMouseDown,
      wheel: onWheel,
    },
    priority,
  );

  return null;
};
