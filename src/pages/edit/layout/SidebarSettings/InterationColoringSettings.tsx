import { StaticRuleEdit } from "../../fields/StaticRuleEdit/StaticRuleEdit";

export const InterationColoringSettings = () => {
  return (
    <>
      <StaticRuleEdit name='gradient' />
      <StaticRuleEdit name='bandSmoothing' />
    </>
  );
};
