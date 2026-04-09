import { GradientStop } from "@/features/fractals";
import { useStaticRule } from "../../stores/editStore/data/useStaticRule";
import { useActions } from "../../stores/editStore/data/useActions";
import { TrapColoringGradient } from "./TrapColoringGradient";

export const TrapGradientEdit = ({ gradientId }: { gradientId: number }) => {
  const [gradients, setGradients] = useStaticRule("gradients");
  const gradientsArr = gradients as GradientStop[][];
  const { gradientsOverride } = useActions();

  return (
    <TrapColoringGradient
      value={
        gradientsArr[gradientId] ?? [
          [0, [1, 1, 1, 1]],
          [100, [0, 0, 0, 1]],
        ]
      }
      onChange={(newGradient) => {
        const updated = [...gradientsArr];
        updated[gradientId] = newGradient;
        setGradients("gradients", updated);
      }}
      onPreview={(stops) => gradientsOverride(gradientId, stops)}
    />
  );
};
