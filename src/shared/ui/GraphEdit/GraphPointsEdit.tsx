import { Vector2 } from "@/shared/libs/vectors";
import {
  fromCanvasPixels,
  toCanvasPixels,
  toCanvasSpace,
  toValueSpace,
} from "./coordinateUtils";
import { DraggablePoint } from "../DraggablePoint/DraggablePoint";
import { DefaultPoint } from "../Points/DefaultPoint";
import { useGraphEditContext } from "./context";

export const PointsEdit = ({
  points,
  renderPoint,
  onPointMoveStart,
  onPointMoveEnd,
  onPointMove,
  onPointClick,
}: {
  points: Vector2[];
  onPointMoveStart?: (index: number) => void;
  onPointMoveEnd?: (index: number) => void;
  renderPoint?: (index: number) => React.ReactNode;
  onPointMove?: (index: number, newPos: Vector2) => void;
  onPointClick?: (index: number) => void;
}) => {
  const { offset, size, axisRangeSizes, options, getBoundPos } =
    useGraphEditContext();

  return (
    <>
      {points.map((stepCoord, i) => {
        const coords = toCanvasSpace(
          stepCoord as Vector2,
          axisRangeSizes,
          offset,
        );
        const pixelCoords = toCanvasPixels(coords, size, options);

        return (
          <DraggablePoint
            key={i}
            canDrag={!!onPointMove}
            left={Math.round(pixelCoords[0])}
            top={Math.round(pixelCoords[1])}
            onDragStop={
              onPointMoveEnd &&
              (() => {
                if (onPointMoveEnd) {
                  onPointMoveEnd(i);
                }
              })
            }
            onDragStart={
              onPointMoveStart &&
              (() => {
                if (onPointMoveStart) {
                  onPointMoveStart(i);
                }
              })
            }
            onClick={onPointClick ? () => onPointClick(i) : undefined}
            onPositionChange={(t) => {
              const bound = getBoundPos();
              const coords = fromCanvasPixels(
                [t[0] - bound[0], t[1] - bound[1]],
                size,
                options,
              );

              const valueCoords = toValueSpace(coords, axisRangeSizes, offset);
              if (onPointMove) {
                onPointMove(i, valueCoords);
              }
            }}
          >
            {renderPoint ? renderPoint(i) : <DefaultPoint />}
          </DraggablePoint>
        );
      })}
    </>
  );
};
