import { Vector2 } from "@/shared/libs/vectors";
import { ReactNode, useState, useCallback } from "react";

export const SelectArea = ({
  enable = false, children, onSelect,
}: {
  enable?: boolean;
  children: ReactNode;
  onSelect: (
    startCoord: Vector2,
    size: Vector2,
    containerSize: Vector2
  ) => void;
}) => {
  const [startCoords, setStartCoord] = useState<Vector2>([0, 0]);
  const [dims, setDims] = useState<Vector2>([0, 0]);
  const [containerOffset, setContainerOffset] = useState<Vector2>([0, 0]);
  const [containerSize, setContainerSize] = useState<Vector2>([0, 0]);

  const [selectionInProgress, setSelectionInProgress] = useState(false);

  return (
    <div
      ref={useCallback((el: HTMLDivElement) => {
        if (!el) {
          return;
        }

        const bound = el.getBoundingClientRect();

        setContainerOffset([bound.left, bound.top]);
        setContainerSize([bound.width, bound.height]);
      }, [])}
      onMouseDown={enable
        ? (e) => {
          setStartCoord([
            e.clientX - containerOffset[0],
            e.clientY - containerOffset[1],
          ]);
          setDims([0, 0]);
          setSelectionInProgress(true);
        }
        : undefined}
      onMouseMove={(e) => {
        if (!selectionInProgress) {
          return;
        }
        const newWidth = e.clientX - containerOffset[0] - startCoords[0];
        const newHeight = e.clientY - containerOffset[1] - startCoords[1];
        const biggestSide = Math.max(Math.abs(newWidth), Math.abs(newHeight));

        setDims([
          Math.sign(newWidth) * biggestSide,
          Math.sign(newHeight) * biggestSide,
        ]);
      }}
      onMouseUp={() => {
        if (!selectionInProgress) {
          return;
        }

        setSelectionInProgress(false);
        const { pos, dims: dimensions } = transformToPositiveDims(
          startCoords,
          dims
        );
        onSelect(pos, dimensions, containerSize);
      }}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
      }}
    >
      {selectionInProgress && (
        <div
          style={{
            position: "absolute",
            ...calcStyleForSquare(startCoords, dims),
            border: "1px dashed rgba(82, 0, 204, 0.5)",
            backgroundColor: "rgba(112, 0, 204, 0.1)",
            pointerEvents: "none",
            zIndex: 1,
          }} />
      )}
      {children}
    </div>
  );
};
const transformToPositiveDims = (startCoord: Vector2, dimensions: Vector2) => {
  const pos: Vector2 = [...startCoord];
  const dims: Vector2 = [...dimensions];
  if (dims[0] < 0) {
    pos[0] = pos[0] + dims[0];
    dims[0] = -dims[0];
  }

  if (dims[1] < 0) {
    pos[1] = pos[1] + dims[1];
    dims[1] = -dims[1];
  }

  return { pos, dims };
};
const calcStyleForSquare = (startCoord: Vector2, dimensions: Vector2) => {
  const { pos, dims } = transformToPositiveDims(startCoord, dimensions);

  return {
    top: pos[1],
    left: pos[0],
    width: dims[0],
    height: dims[1],
  };
};
