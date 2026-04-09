import { GradientStop } from "@/features/fractals";
import { useStaticRule } from "../../stores/editStore/data/useStaticRule";
import { useActions } from "../../stores/editStore/data/useActions";
import { EscapeColoringGradient } from "./EscapeColoringGradient";

export const IterationGradientEdit = ({
  gradientId,
}: {
  gradientId: number;
}) => {
  const [gradients, setGradients] = useStaticRule("gradients");
  const gradientsArr = gradients as GradientStop[][];
  const { gradientsOverride } = useActions();

  return (
    <EscapeColoringGradient
      value={gradientsArr[gradientId] ?? []}
      onChange={(newGradient) => {
        const updated = [...gradientsArr];
        updated[gradientId] = newGradient;
        setGradients("gradients", updated);
      }}
      onPreview={(stops) => gradientsOverride(gradientId, stops)}
    />
  );
};
