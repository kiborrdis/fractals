import { FractalParamsBuildRules, GradientStop } from "@/features/fractals";
import { useEditStore } from "../provider";
import { makeRuleFromNumber } from "@/shared/libs/numberRule";

export const useFractalDynamicRules = () => {
  const fractal = useEditStore((state) => state.fractal.dynamic);
  return fractal;
};

export const useFractalCustomRules = () => {
  const fractal = useEditStore((state) => state.fractal.custom);
  return fractal;
};

export const useFractalParamsData = () => {
  const fractal = useEditStore((state) => state.fractal);
  const overrides = useEditStore((state) => state.fractalOverrides);
  if (Object.keys(overrides).length === 0) {
    return fractal;
  }

  return {
    ...fractal,
    gradient: (overrides.gradient as GradientStop[]) ?? fractal.gradient,
    trapGradient:
      (overrides.trapGradient as GradientStop[]) ?? fractal.trapGradient,
    custom: mergeFractalParams(
      mergeFractalParams({}, fractal.custom),
      overrides.custom,
      transformValue,
    ) as FractalParamsBuildRules["custom"],
    dynamic: mergeFractalParams(
      mergeFractalParams({}, fractal.dynamic),
      overrides.dynamic,
      transformValue,
    ) as FractalParamsBuildRules["dynamic"],
  } satisfies FractalParamsBuildRules;
};

const transformValue = (value: unknown): unknown => {
  if (typeof value === "number") {
    return makeRuleFromNumber(value);
  }

  if (Array.isArray(value)) {
    return value.map((v) => transformValue(v));
  }

  return value;
};

const mergeFractalParams = (
  target: unknown,
  source: unknown,
  transform?: (value: unknown) => unknown,
): unknown => {
  if (source === null || source === undefined) {
    return target;
  }
  if (target === null || target === undefined) {
    return transform ? transform(source) : source;
  }

  // Handle arrays - merge by index and extend if source is longer
  if (Array.isArray(target) && Array.isArray(source)) {
    const result = [...target];
    source.forEach((item, index) => {
      if (item !== undefined) {
        if (index < result.length) {
          result[index] = mergeFractalParams(result[index], item, transform);
        } else {
          result.push(transform ? transform(item) : item);
        }
      }
    });
    return result;
  }

  if (
    typeof target === "object" &&
    typeof source === "object" &&
    !Array.isArray(target) &&
    !Array.isArray(source)
  ) {
    const result = { ...target };

    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (key in source && (source as any)[key] !== undefined) {
          if (key in result) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (result as any)[key] = mergeFractalParams(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (result as any)[key],

              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (source as any)[key],
              transform,
            );
          } else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (result as any)[key] = transform
              ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                transform((source as any)[key])
              : // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (source as any)[key];
          }
        }
      }
    }

    return result;
  }

  if (Array.isArray(source) && source.every((item) => item === undefined)) {
    return target;
  }

  // For primitive values, source overwrites target
  return transform ? transform(source) : source;
};
