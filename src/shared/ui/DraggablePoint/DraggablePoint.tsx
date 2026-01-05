import { useDrag } from "@/shared/hooks/useDrag";
import { Vector2 } from "@/shared/libs/vectors";
import { DefaultPoint } from "../Points/DefaultPoint";

export const DraggablePoint = ({
  left,
  top,
  canDrag = true,
  onClick,
  onDragStart,
  onDragStop,
  onPositionChange,
  children,
}: {
  left: number;
  top: number;
  canDrag?: boolean;
  onClick?: () => void;
  onPositionChange?: (pos: Vector2) => void;
  onDragStart?: () => void;
  onDragStop?: () => void;
  children?: React.ReactNode;
}) => {
  const { elementHandlers } = useDrag({
    canStartDrag: canDrag,
    onDragStart: onDragStart,
    onDragStop: onDragStop,
    onDragMove: (pos) => {
      if (onPositionChange) {
        onPositionChange(pos);
      }
    },
  });
  return (
    <div
      {...elementHandlers}
      onClick={onClick}
      draggable={false}
      style={{
        position: "absolute",
        top: top,
        left: left,
        transform: "translate(-50%, -50%)",
        cursor: !canDrag || !onPositionChange ? undefined : "grab",
        pointerEvents: "all",
        opacity: 1,
        zIndex: 2,
      }}
    >
      {children || <DefaultPoint />}
    </div>
  );
};
