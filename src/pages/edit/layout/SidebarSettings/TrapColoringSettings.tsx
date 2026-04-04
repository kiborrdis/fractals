import { StaticRuleEdit } from "../../fields/StaticRuleEdit/StaticRuleEdit";
import { DynamicRuleEdit } from "../../fields/DynamicRuleEdit/DynamicRuleEdit";

export const TrapColoringSettings = () => {
  return (
    <>
      <StaticRuleEdit name='traps' />
      <DynamicRuleEdit name='trapDistMult' />
      <DynamicRuleEdit name='trapDistPow' />
      <StaticRuleEdit name='trapGradient' />
    </>
  );
};
