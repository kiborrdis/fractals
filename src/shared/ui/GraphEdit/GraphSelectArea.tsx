import { Vector2 } from "@/shared/libs/vectors";
import {
  MouseEvent,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useGraphEditContext, useGraphEditRegisterHandler } from "./context";
import { fromCanvasPixels, toValueSpace } from "./coordinateUtils";

type PixelSelection = {
  start: Vector2;
  current: Vector2;
};

const normalizeRect = (
  start: Vector2,
  end: Vector2,
): { pos: Vector2; dims: Vector2 } => ({
  pos: [Math.min(start[0], end[0]), Math.min(start[1], end[1])],
  dims: [Math.abs(end[0] - start[0]), Math.abs(end[1] - start[1])],
});

const constrainToSquare = (start: Vector2, end: Vector2): Vector2 => {
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  const side = Math.max(Math.abs(dx), Math.abs(dy));
  return [start[0] + Math.sign(dx) * side, start[1] + Math.sign(dy) * side];
};

const defaultRenderArea = (pos: Vector2, dims: Vector2) => (
  <div
    style={{
      position: "absolute",
      top: pos[1],
      left: pos[0],
      width: dims[0],
      height: dims[1],
      border: "1px dashed rgba(82, 0, 204, 0.5)",
      backgroundColor: "rgba(112, 0, 204, 0.1)",
      pointerEvents: "none",
      zIndex: 1,
    }}
  />
);

export const GraphSelectArea = ({
  enable = true,
  onSelect,
  priority,
  forceSquare = false,
  renderArea = defaultRenderArea,
}: {
  enable?: boolean;
  onSelect: (startCoord: Vector2, size: Vector2) => void;
  priority?: number;
  forceSquare?: boolean;
  /** Render the selection overlay. Receives position and dimensions in pixel space relative to the graph container. */
  renderArea?: (pos: Vector2, dims: Vector2) => ReactNode;
}) => {
  const { offset, axisRangeSizes, size, options, getBoundPos } =
    useGraphEditContext();

  const selectionRef = useRef<PixelSelection | null>(null);
  const [selection, setSelection] = useState<PixelSelection | null>(null);

  const contextRef = useRef({
    offset,
    axisRangeSizes,
    size,
    options,
    getBoundPos,
  });
  useEffect(() => {
    contextRef.current = { offset, axisRangeSizes, size, options, getBoundPos };
  }, [offset, axisRangeSizes, size, options, getBoundPos]);

  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      if (!enable) {
        return;
      }
      const bound = getBoundPos();
      const start: Vector2 = [e.clientX - bound[0], e.clientY - bound[1]];
      const state: PixelSelection = { start, current: start };
      selectionRef.current = state;
      setSelection(state);
    },
    [enable, getBoundPos],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!selectionRef.current) {
        return;
      }
      const bound = getBoundPos();
      const raw: Vector2 = [e.clientX - bound[0], e.clientY - bound[1]];
      const current = forceSquare
        ? constrainToSquare(selectionRef.current.start, raw)
        : raw;
      const updated: PixelSelection = {
        start: selectionRef.current.start,
        current,
      };

      selectionRef.current = updated;
      setSelection({ ...updated });
    },
    [getBoundPos, forceSquare],
  );

  const handleMouseLeave = useCallback(() => {
    selectionRef.current = null;
    setSelection(null);
  }, []);

  useGraphEditRegisterHandler(
    {
      mouseDown: handleMouseDown,
      move: handleMouseMove,
      mouseLeave: handleMouseLeave,
    },
    priority,
  );

  useEffect(() => {
    const handleMouseUp = () => {
      if (!selectionRef.current) {
        return;
      }

      const { start, current } = selectionRef.current;
      const { offset, axisRangeSizes, size, options } = contextRef.current;

      const toValue = (px: Vector2): Vector2 =>
        toValueSpace(
          fromCanvasPixels(px, size, options),
          axisRangeSizes,
          offset,
        );

      const startValue = toValue(start);
      const endValue = toValue(current);
      const { pos, dims } = normalizeRect(startValue, endValue);

      selectionRef.current = null;
      setSelection(null);
      onSelectRef.current(pos, dims);
    };

    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, []);

  if (!selection) {
    return null;
  }

  const { pos, dims } = normalizeRect(selection.start, selection.current);
  return <>{renderArea(pos, dims)}</>;
};
