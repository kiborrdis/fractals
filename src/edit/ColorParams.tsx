import { Stack } from "@mantine/core";
import { ColorRuleEdit } from "./ColorRuleEdit";
import { FractalParamsBuildRules } from "../fractals/types";
import React from "react";

export const ColorParams = React.memo(
  ({
    params,
    setParams,
  }: {
    params: FractalParamsBuildRules;
    setParams: React.Dispatch<React.SetStateAction<FractalParamsBuildRules>>;
  }) => {
    return (
      <Stack gap="sm">
        <ColorRuleEdit
          label="Start color"
          value={params.colorStart}
          onChange={(value) => {
            setParams((prev) => ({
              ...prev,
              colorStart: value,
            }));
          }}
        />
        <ColorRuleEdit
          label="End color"
          value={params.colorEnd}
          onChange={(value) => {
            setParams((prev) => ({
              ...prev,
              colorEnd: value,
            }));
          }}
        />

        <ColorRuleEdit
          label="Overflow color"
          value={params.colorOverflow}
          onChange={(value) => {
            setParams((prev) => ({
              ...prev,
              colorOverflow: value,
            }));
          }}
        />
      </Stack>
    );
  }
);
ColorParams.displayName = "ColorParams";
