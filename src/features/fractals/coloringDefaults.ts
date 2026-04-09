import { GradientStop } from "./types";
import { BlendMode, ColoringBuildRule, ColoringMode } from "./types";
import { RuleType } from "@/shared/libs/numberRule";

export const COLORING_MODE_GRADIENT_COUNT: Record<ColoringMode, number> = {
  [ColoringMode.Iterations]: 1,
  [ColoringMode.Trap]: 1,
  [ColoringMode.Border]: 1,
  [ColoringMode.Normal]: 1,
  [ColoringMode.StripesAverage]: 0,
};

export const COLORING_MODE_DEFAULT_PARAMS: Record<ColoringMode, number[]> = {
  [ColoringMode.Iterations]: [],
  [ColoringMode.Trap]: [25, 0.5],
  [ColoringMode.Border]: [10, 0.5],
  [ColoringMode.Normal]: [0],
  [ColoringMode.StripesAverage]: [],
};

export const COLORING_MODE_DEFAULT_GRADIENT: Record<
  ColoringMode,
  GradientStop[]
> = {
  [ColoringMode.Iterations]: [
    [0, [0, 0, 0, 1]],
    [10, [0.8, 0, 0, 1]],
    [30, [1, 0.6666666666666666, 0, 1]],
    [40, [1, 0.9490196078431372, 0, 1]],
    [70, [0.9921568627450981, 1, 0.6, 1]],
    [100, [1, 0.9372549019607843, 0.8392156862745098, 1]],
  ],
  [ColoringMode.Trap]: [
    [0, [1, 0.9372549019607843, 0.8392156862745098, 1]],
    [1, [1, 0.9372549019607843, 0.8392156862745098, 1]],
    [1.7, [0.9921568627450981, 1, 0.6, 1]],
    [3, [1, 0.9490196078431372, 0, 1]],
    [5, [1, 0.6666666666666666, 0, 1]],
    [8, [0.8, 0, 0, 1]],
    [15, [0, 0, 0, 1]],
  ],
  [ColoringMode.Border]: [
    [0, [1, 1, 1, 1]],
    [1, [0, 0, 0, 1]],
  ],
  [ColoringMode.Normal]: [
    [0, [0, 0, 0, 1]],
    [1, [1, 1, 1, 1]],
  ],
  [ColoringMode.StripesAverage]: [],
};

export const makeDefaultColoringEntry = (
  mode: ColoringMode,
  gradientStartIndex: number,
): ColoringBuildRule => {
  const paramRules = COLORING_MODE_DEFAULT_PARAMS[mode].map((v) => ({
    t: RuleType.StaticNumber as const,
    value: v,
  }));
  const gradCount = COLORING_MODE_GRADIENT_COUNT[mode];
  const gradIds = Array.from(
    { length: gradCount },
    (_, i) => gradientStartIndex + i,
  );
  return [
    mode,
    gradIds,
    paramRules,
    BlendMode.Normal,
  ] as unknown as ColoringBuildRule;
};
