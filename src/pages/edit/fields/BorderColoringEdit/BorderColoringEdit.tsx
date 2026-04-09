import { StaticRuleEdit } from "../StaticRuleEdit/StaticRuleEdit";
import { useColoringEntry } from "../../stores/editStore/data/useColoringRules";
import { useActions } from "../../stores/editStore/data/useActions";
import { NumberRuleEdit } from "../NumberRuleEdit/NumberRuleEdit";
import { NumberBuildRule } from "@/shared/libs/numberRule";

export const BorderColoringEdit = ({
  coloringIndex,
}: {
  coloringIndex: number;
}) => {
  const entry = useColoringEntry(coloringIndex);
  const { editColoringParams } = useActions();

  return (
    <>
      <StaticRuleEdit name='borderColor' />
      <NumberRuleEdit
        name='borderDistMult'
        label='Border Distance Multiplier'
        min={0}
        max={1000000}
        step={1}
        minRange={1}
        value={entry[2][0] as NumberBuildRule}
        onChange={(_name, rule) => editColoringParams(coloringIndex, 0, rule)}
      />
      <NumberRuleEdit
        name='borderDistPow'
        label='Border Distance Power'
        min={0}
        max={50}
        step={0.1}
        minRange={0.1}
        value={entry[2][1] as NumberBuildRule}
        onChange={(_name, rule) => editColoringParams(coloringIndex, 1, rule)}
      />
    </>
  );
};
