import { StaticRuleEdit } from "../StaticRuleEdit/StaticRuleEdit";
import { TrapGradientEdit } from "../GradientInput/TrapGradientEdit";
import { useColoringEntry } from "../../stores/editStore/data/useColoringRules";
import { ColoringMode } from "@/features/fractals";
import { useActions } from "../../stores/editStore/data/useActions";
import { NumberRuleEdit } from "../NumberRuleEdit/NumberRuleEdit";

export const TrapColoringEdit = ({
  coloringIndex,
}: {
  coloringIndex: number;
}) => {
  const entry = useColoringEntry(coloringIndex);
  const { editColoringParams } = useActions();

  if (entry[0] !== ColoringMode.Trap) {
    return null;
  }

  const gradientId = entry[1][0];
  const distMultRule = entry[2][0];
  const distPowRule = entry[2][1];

  return (
    <>
      <StaticRuleEdit name='traps' />
      <NumberRuleEdit
        name='trapDistMult'
        label='Trap Distance Multiplier'
        min={0}
        max={1000000}
        step={1}
        minRange={1}
        value={distMultRule}
        onChange={(_name, rule) => editColoringParams(coloringIndex, 0, rule)}
      />
      <NumberRuleEdit
        name='trapDistPow'
        label='Trap Distance Power'
        min={0}
        max={50}
        step={0.1}
        minRange={0.1}
        value={distPowRule}
        onChange={(_name, rule) => editColoringParams(coloringIndex, 1, rule)}
      />
      <TrapGradientEdit gradientId={gradientId} />
    </>
  );
};
