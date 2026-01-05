import {
  MouseEvent as ReactMouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { throttle } from "../libs/fn-modifiers";

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

  const dragEnabledRef = useRef(dragEnabled);
  dragEnabledRef.current = dragEnabled;

  const dragMoveRef = useRef<typeof onDragMove>(onDragMove);
  dragMoveRef.current = onDragMove;
  const dragStopRef = useRef<typeof onDragStop | undefined>(onDragStop);
  dragStopRef.current = onDragStop;

  useEffect(() => {
    const handler = () => {
      clearTimeout(startTimeoutRef.current);
    };

    window.addEventListener("mouseup", handler);

    return () => {
      document.body.style.userSelect = "auto";
      window.removeEventListener("mouseup", handler);
    };
  }, []);

  useEffect(() => {
    if (!dragEnabled) {
      return;
    }

    const handler = throttle((e: MouseEvent) => {
      const coords: Vector2 = [e.clientX, e.clientY];

      if (withRAF) {
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
        }

        rafRef.current = requestAnimationFrame(() => {
          if (!prevPosRef.current) {
            return;
          }

          intermediateDataRef.current = dragMoveRef.current(
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

      if (prevPosRef.current && dragEnabledRef.current) {
        intermediateDataRef.current = dragMoveRef.current(
          [e.clientX, e.clientY],
          [
            e.clientX - prevPosRef.current[0],
            e.clientY - prevPosRef.current[1],
          ],
          intermediateDataRef.current!,
        );
      }

      prevPosRef.current = [e.clientX, e.clientY];
    }, 25);

    const handlerUp = () => {
      if (dragStopRef.current) {
        dragStopRef.current(
          prevPosRef.current || [0, 0],
          intermediateDataRef.current!,
        );
        document.body.style.userSelect = "auto";
        intermediateDataRef.current = undefined;
      }

      setDragEnabled(false);
    };
    window.addEventListener("mousemove", handler);
    window.addEventListener("mouseup", handlerUp);

    return () => {
      window.removeEventListener("mousemove", handler);
      window.removeEventListener("mouseup", handlerUp);
    };
  }, [dragEnabled, withRAF]);

  const onMouseDown = useCallback(
    (e: ReactMouseEvent) => {
      if (canStartDrag) {
        prevPosRef.current = null;

        startTimeoutRef.current = setTimeout(() => {
          if (onDragStart) {
            intermediateDataRef.current = onDragStart(e.currentTarget, [
              e.clientX,
              e.clientY,
            ]);
            document.body.style.userSelect = "none !important";
          }

          setDragEnabled(true);
        }, 250);
        e.stopPropagation();
        e.preventDefault();
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
