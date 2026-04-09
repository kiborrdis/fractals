import { StaticRuleEdit } from "../StaticRuleEdit/StaticRuleEdit";
import { IterationGradientEdit } from "../GradientInput/IterationGradientEdit";
import { useColoringEntry } from "../../stores/editStore/data/useColoringRules";
import { ColoringMode } from "@/features/fractals";

export const InterationColoringEdit = ({
  coloringIndex,
}: {
  coloringIndex: number;
}) => {
  const entry = useColoringEntry(coloringIndex);

  if (entry[0] !== ColoringMode.Iterations) {
    return null;
  }

  const gradientId = entry[1][0];

  return (
    <>
      <IterationGradientEdit gradientId={gradientId} />
      <StaticRuleEdit name='bandSmoothing' />
    </>
  );
};
