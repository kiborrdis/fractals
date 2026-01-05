import { Vector2 } from "@/shared/libs/vectors";
import { PointsEdit } from "@/shared/ui/GraphEdit";
import { DefaultPoint } from "@/shared/ui/Points/DefaultPoint";
import { DimmedPoint } from "@/shared/ui/Points/DimmedPoint";
import { SelectedPoint } from "@/shared/ui/Points/SelectedPoint";

export const StepPointsEdit = ({
  points,
  selectedIndex,
  mode,
  onMoveStep,
  onSelectStep,
}: {
  points: Vector2[];
  selectedIndex: number | null;
  mode: "view" | "addPoint";
  onMoveStep: (index: number, newPos: Vector2) => void;
  onSelectStep: (index: number | null) => void;
}) => {
  return (
    <PointsEdit
      points={points}
      onPointMove={onMoveStep}
      onPointClick={(i) => onSelectStep(selectedIndex === i ? null : i)}
      renderPoint={(i) =>
        mode === "view" ? (
          selectedIndex === i ? (
            <SelectedPoint />
          ) : (
            <DefaultPoint />
          )
        ) : (
          <DimmedPoint />
        )
      }
    />
  );
};
