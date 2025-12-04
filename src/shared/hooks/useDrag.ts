import {
  MouseEvent as ReactMouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

type Vector2 = [number, number];

export const useDrag = <ID = undefined>({
  canStartDrag,
  withRAF,
  onDragStart,
  onDragMove,
  onDragStop,
}: {
  canStartDrag: boolean;
  withRAF?: boolean;
  onDragStart?: (elem: Element, mousePosition: Vector2) => ID;
  onDragStop?: (mousePosition: Vector2, intermediate: ID) => void;
  onDragMove: (mousePosition: Vector2, delta: Vector2, intermediate: ID) => ID;
}) => {
  const startTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const rafRef = useRef<number | undefined>(undefined);
  const intermediateDataRef = useRef<ID | undefined>(undefined);

  const prevPosRef = useRef<Vector2 | null>(null);
  const [dragEnabled, setDragEnabled] = useState(false);

  useEffect(() => {
    const handler = () => {
      clearTimeout(startTimeoutRef.current);
    };

    window.addEventListener("mouseup", handler);

    return () => {
      window.removeEventListener("mouseup", handler);
    };
  }, []);

  useEffect(() => {
    if (!dragEnabled) {
      return;
    }

    const handler = (e: MouseEvent) => {
      const coords: Vector2 = [e.clientX, e.clientY];

      if (withRAF) {
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
        }

        rafRef.current = requestAnimationFrame(() => {
          if (!prevPosRef.current) {
            return;
          }

          intermediateDataRef.current = onDragMove(
            coords,
            [
              coords[0] - prevPosRef.current[0],
              coords[1] - prevPosRef.current[1],
            ],
            intermediateDataRef.current!,
          );

          prevPosRef.current = coords;
        });

        if (!prevPosRef.current) {
          prevPosRef.current = [e.clientX, e.clientY];
        }
        return;
      }

      if (prevPosRef.current) {
        intermediateDataRef.current = onDragMove(
          [e.clientX, e.clientY],
          [
            e.clientX - prevPosRef.current[0],
            e.clientY - prevPosRef.current[1],
          ],
          intermediateDataRef.current!,
        );
      }

      prevPosRef.current = [e.clientX, e.clientY];
    };

    const handlerUp = () => {
      if (onDragStop) {
        onDragStop(prevPosRef.current || [0, 0], intermediateDataRef.current!);
        intermediateDataRef.current = undefined;
      }

      prevPosRef.current = null;

      setDragEnabled(false);
    };
    window.addEventListener("mousemove", handler);
    window.addEventListener("mouseup", handlerUp);

    return () => {
      window.removeEventListener("mousemove", handler);
      window.removeEventListener("mouseup", handlerUp);
    };
  }, [dragEnabled, onDragMove, onDragStop, withRAF]);

  const onMouseDown = useCallback(
    (e: ReactMouseEvent) => {
      if (canStartDrag) {
        if (onDragStart) {
          intermediateDataRef.current = onDragStart(e.currentTarget, [
            e.clientX,
            e.clientY,
          ]);
        }

        startTimeoutRef.current = setTimeout(() => setDragEnabled(true), 250);
        e.stopPropagation();
      }
    },
    [canStartDrag, onDragStart],
  );

  return {
    elementHandlers: {
      onMouseDown,
    },
    dragInProgress: dragEnabled,
  };
};
