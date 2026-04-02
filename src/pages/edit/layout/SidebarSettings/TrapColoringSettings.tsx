import React from "react";
import { StaticRuleEdit } from "../../fields/StaticRuleEdit/StaticRuleEdit";

export const TrapColoringSettings = () => {
  return (
    <>
      <StaticRuleEdit name='traps' />
      <StaticRuleEdit name='trapIntensity' />
      <StaticRuleEdit name='trapGradient' />
    </>
  );
};
