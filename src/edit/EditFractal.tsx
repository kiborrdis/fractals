import { useState } from "react";
import { ActionIcon, Group, Paper, Stack, Tabs } from "@mantine/core";
import { FractalParams, FractalParamsBuildRules, RangeNumberRule, RuleType } from "../fractals/types";
import { FaPlay } from "react-icons/fa";
import { useStateWithQueryPersistence } from "../useStateWithQueryPersistence";
import { DisplayFractal } from "../DisplayFractal";
import { makeRulesBasedOnParams } from "../ruleConversion";
import { ShapeParams } from "./ShapeParams";
import { ColorParams } from "./ColorParams";
import { PeriodGraph } from "./PeriodGraph";

const initialFractalParams: FractalParams = {
  invert: false,
  mirror: false,
  colorStart: [0.7803959025681232, 0.8286006045344724, 0.8742375132153735],
  colorEnd: [0.9294395326843901, 0.14428688157634406, 0.386154731668613],
  colorOverflow: [0.278634668037373, 0.04227163613144469, 0.3846757635418552],
  splitNumber: 0.4875142979845785,
  time: 0,
  c: [-0.5107646917831926, -0.5423690294181617],
  r: 2,
  rRangeStart: [-0.46873034440015887, -0.4832997472169364],
  rRangeEnd: [0.5075717619717306, 0.4917917550166656],
  maxIterations: 100,
  linearSplitPerDistChange: [0, 0],
  radialSplitPerDistChange: [0, 0],
  cxSplitPerDistChange: [0, 0],
  cySplitPerDistChange: [0, 0],
  rSplitPerDistChange: [0, 0],
  iterationsSplitPerDistChange: [0, 0],
  angularSplitNumber: 181,
};

const defaultRules = makeRulesBasedOnParams(initialFractalParams);

export function EditFractal() {
  const [play, setPlay] = useState(false);
  const [params, setParams] =
    useStateWithQueryPersistence<FractalParamsBuildRules>("s", defaultRules);
  const [time, setTime] = useState(0);

  return (
    <>
      <DisplayFractal params={params} play={play} onRender={setTime} />
      <PeriodGraph rangeRules={findAllRangeRules(params)} time={time} />
      <Paper
        w={400}
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          maxHeight: "calc(100vh - 40px)",
          overflowY: "auto",
        }}
        p="md"
      >
        <Tabs defaultValue="shape">
          <Group
            style={{ position: "sticky", top: 0, zIndex: 5 }}
            mb="md"
            bg="gray.8"
          >
            <Stack>
              <ActionIcon
                onClick={() => setPlay((prev) => !prev)}
                color={play ? "green" : "gray"}
              >
                <FaPlay />
              </ActionIcon>
              <Tabs.List>
                <Tabs.Tab value="shape">Shape</Tabs.Tab>
                <Tabs.Tab value="colors">Colors</Tabs.Tab>
              </Tabs.List>
            </Stack>
          </Group>

          <Tabs.Panel value="shape">
            <ShapeParams params={params} setParams={setParams} />
          </Tabs.Panel>

          <Tabs.Panel value="colors">
            <ColorParams params={params} setParams={setParams} />
          </Tabs.Panel>
        </Tabs>
      </Paper>
    </>
  );
}


const findAllRangeRules = (
  rules: FractalParamsBuildRules
): RangeNumberRule[] => {
  return Object.values(rules).reduce((acc, value) => {
    if (Array.isArray(value)) {
      acc.push(...value.filter((v) => v.t === RuleType.RangeNumber));
    } else if (value.t === RuleType.RangeNumber) {
      acc.push(value);
    }
    return acc;
  }, [] as RangeNumberRule[]);
}