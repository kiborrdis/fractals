import {
  createBSplineRuleFromPoints,
  NumberBuildRule,
  NVectorStepRule,
  RuleType,
  Vector2BSplineRule,
} from "@/shared/libs/numberRule";
import { ActionIcon, Menu } from "@mantine/core";
import { LuSeparatorVertical, LuSpline } from "react-icons/lu";
import { TbStairs, TbQuestionMark } from "react-icons/tb";

const valueToIcon = {
  separate: <LuSeparatorVertical />,
  spline: <LuSpline />,
  steps: <TbStairs />,
  unknown: <TbQuestionMark />,
};

export const VectorRuleTypeMenu = ({
  value,
  onChange,
  min,
  max,
  name,
}: {
  value: "separate" | "spline" | "steps" | "unknown";
  name: string;
  min: number;
  max: number;
  onChange: (
    name: string,
    value:
      | Vector2BSplineRule
      | NVectorStepRule<2>
      | [NumberBuildRule, NumberBuildRule],
  ) => void;
}) => {
  return (
    <Menu shadow='md' width={200}>
      <Menu.Target>
        <ActionIcon size={14} variant='transparent'>
          {valueToIcon[value as keyof typeof valueToIcon]}
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Vector rule</Menu.Label>
        <Menu.Item
          onClick={() => {
            if (value === "separate") {
              return;
            }
            onChange(name, [
              {
                t: RuleType.StaticNumber,
                value: (max - min) / 2 + min,
              },
              {
                t: RuleType.StaticNumber,
                value: (max - min) / 2 + min,
              },
            ]);
          }}
          leftSection={valueToIcon["separate"]}
        >
          Separate
        </Menu.Item>
        <Menu.Item
          onClick={() => {
            if (value === "spline") {
              return;
            }

            onChange(
              name,
              createBSplineRuleFromPoints(10, [
                [max / 3, 0],
                [0, min / 3],
                [min / 3, 0],
                [0, max / 3],
              ]),
            );
          }}
          leftSection={valueToIcon["spline"]}
        >
          Spline
        </Menu.Item>
        <Menu.Item
          onClick={() => {
            if (value === "steps") {
              return;
            }

            onChange(name, {
              t: RuleType.StepNVector,
              dimension: 2,
              steps: [
                [max / 3, 0],
                [0, min / 3],
                [min / 3, 0],
                [0, max / 3],
              ],
              transitions: [
                { fns: [{ t: "linear" }, { t: "linear" }], len: 10 },
                { fns: [{ t: "linear" }, { t: "linear" }], len: 10 },
                { fns: [{ t: "linear" }, { t: "linear" }], len: 10 },
                { fns: [{ t: "linear" }, { t: "linear" }], len: 10 },
              ],
            });
          }}
          leftSection={valueToIcon["steps"]}
        >
          Steps
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};
