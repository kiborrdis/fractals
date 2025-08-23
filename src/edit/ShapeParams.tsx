import { Stack } from "@mantine/core";
import { BooleanRuleEdit } from "./BooleanRuleEdit";
import { FractalParamsBuildRules } from "../fractals/types";
import { NumberRuleEdit } from "./NumberRuleEdit";
import { Vector2RuleEdit, Vector2RulePolarEdit } from "./Vector2RuleEdit";
import React from "react";

export const ShapeParams = React.memo(
  ({
    params,
    setParams,
  }: {
    params: FractalParamsBuildRules;
    setParams: React.Dispatch<React.SetStateAction<FractalParamsBuildRules>>;
  }) => {
    return (
      <Stack gap="sm">
        <BooleanRuleEdit
          labels={["Inverting on", "Inverting off"]}
          value={params.invert}
          onChange={(value) => {
            setParams((prev) => ({
              ...prev,
              invert: value,
            }));
          }}
        />
        <Vector2RulePolarEdit
          value={params.c}
          onChange={(value) => {
            setParams((prev) => ({
              ...prev,
              c: value,
            }));
          }}
        />
        <Vector2RuleEdit
          label="C"
          value={params.c}
          sublabels={["Rl", "Im"]}
          onChange={(value) => {
            setParams((prev) => ({
              ...prev,
              c: value,
            }));
          }}
          min={-0.8}
          max={0.8}
          step={0.001}
          minRange={0.001}
        />
        <Vector2RuleEdit
          label="C.Rl change per dist"
          value={params.cxSplitPerDistChange}
          sublabels={["X", "Y"]}
          onChange={(value) => {
            setParams((prev) => ({
              ...prev,
              cxSplitPerDistChange: value,
            }));
          }}
          min={-0.3}
          max={0.3}
          step={0.0001}
          minRange={0.0001}
        />

        <Vector2RuleEdit
          label="C.Im change per dist"
          value={params.cySplitPerDistChange}
          sublabels={["X", "Y"]}
          onChange={(value) => {
            setParams((prev) => ({
              ...prev,
              cySplitPerDistChange: value,
            }));
          }}
          min={-0.3}
          max={0.3}
          step={0.0001}
          minRange={0.0001}
        />
        <NumberRuleEdit
          label="R"
          value={params.r}
          onChange={(value) => {
            setParams((prev) => ({
              ...prev,
              r: value,
            }));
          }}
          min={0}
          max={2}
          step={0.1}
          minRange={0.1}
        />
        <Vector2RuleEdit
          label="R per dist change"
          value={params.rSplitPerDistChange}
          sublabels={["X", "Y"]}
          onChange={(value) => {
            setParams((prev) => ({
              ...prev,
              rSplitPerDistChange: value,
            }));
          }}
          min={-1}
          max={1}
          step={0.1}
          minRange={0.1}
        />

        <NumberRuleEdit
          label="Iterations"
          value={params.maxIterations}
          onChange={(value) => {
            setParams((prev) => ({
              ...prev,
              maxIterations: value,
            }));
          }}
          min={1}
          max={1000}
          step={1}
          minRange={10}
        />
        <Vector2RuleEdit
          label="Iterations split per dist change"
          value={params.iterationsSplitPerDistChange}
          sublabels={["X", "Y"]}
          onChange={(value) => {
            setParams((prev) => ({
              ...prev,
              iterationsSplitPerDistChange: value,
            }));
          }}
          min={-100}
          max={500}
          step={1}
          minRange={10}
        />
        <NumberRuleEdit
          label="Hex mirroring"
          value={params.hexMirroringFactor}
          onChange={(value) => {
            setParams((prev) => ({
              ...prev,
              hexMirroringFactor: value,
            }));
          }}
          min={0}
          max={1.0}
          step={0.001}
          minRange={0.01}
        />
        <BooleanRuleEdit
          labels={["Mirroring on", "Mirroring off"]}
          value={params.mirror}
          onChange={(value) => {
            setParams((prev) => ({
              ...prev,
              mirror: value,
            }));
          }}
        />
        {params.mirror.value && (
          <>
            <NumberRuleEdit
              label="Linear split number"
              value={params.splitNumber}
              onChange={(value) => {
                setParams((prev) => ({
                  ...prev,
                  splitNumber: value,
                }));
              }}
              min={0.5}
              max={30}
              step={0.1}
              minRange={1}
            />

            <Vector2RuleEdit
              label="Linear split per dist change"
              value={params.linearSplitPerDistChange}
              sublabels={["X", "Y"]}
              onChange={(value) => {
                setParams((prev) => ({
                  ...prev,
                  linearSplitPerDistChange: value,
                }));
              }}
              min={-30}
              max={30}
              step={0.1}
              minRange={0.001}
            />
            <NumberRuleEdit
              label="Radial split number"
              value={params.angularSplitNumber}
              onChange={(value) => {
                setParams((prev) => ({
                  ...prev,
                  angularSplitNumber: value,
                }));
              }}
              min={1}
              max={181}
              step={1}
              minRange={10}
            />
            <Vector2RuleEdit
              label="Radial split per dist change"
              value={params.radialSplitPerDistChange}
              sublabels={["X", "Y"]}
              onChange={(value) => {
                setParams((prev) => ({
                  ...prev,
                  radialSplitPerDistChange: value,
                }));
              }}
              min={-60}
              max={60}
              step={1}
              minRange={1}
            />
          </>
        )}

        <Vector2RuleEdit
          label="R range start"
          value={params.rRangeStart}
          sublabels={["Real", "Imaginary"]}
          onChange={(value) => {
            setParams((prev) => ({
              ...prev,
              rRangeStart: value,
            }));
          }}
          min={-2}
          max={2}
          step={0.01}
          minRange={0.01}
        />
        <Vector2RuleEdit
          label="R range end"
          value={params.rRangeEnd}
          sublabels={["Real", "Imaginary"]}
          onChange={(value) => {
            setParams((prev) => ({
              ...prev,
              rRangeEnd: value,
            }));
          }}
          min={-2}
          max={2}
          step={0.01}
          minRange={0.01}
        />
      </Stack>
    );
  }
);
ShapeParams.displayName = "ShapeParams";
