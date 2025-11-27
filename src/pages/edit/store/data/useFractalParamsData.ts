import {
  FractalParamsBuildRules,
  makeRuleFromNumber,
} from "@/features/fractals";
import { useEditStore } from "../provider";

export const useFractalRules = () => {
  const fractal = useEditStore((state) => state.fractal);
  return fractal;
};

export const useFractalParamsData = () => {
  const fractal = useEditStore((state) => state.fractal);
  const overrides = useEditStore((state) => state.fractalOverrides);

  if (Object.keys(overrides).length === 0) {
    return fractal;
  }

  const merged = mergeDeep(mergeDeep({}, fractal), overrides, (v: unknown) => {
    if (typeof v === "number") {
      return makeRuleFromNumber(v);
    }

    return v;
  });

  return merged as FractalParamsBuildRules;
};

const mergeDeep = (
  target: unknown,
  source: unknown,
  transform?: (value: unknown) => unknown
): unknown => {
  if (source === null || source === undefined) return target;
  if (target === null || target === undefined)
    return transform ? transform(source) : source;

  // Handle arrays - merge by index and extend if source is longer
  if (Array.isArray(target) && Array.isArray(source)) {
    const result = [...target];
    source.forEach((item, index) => {
      if (item !== undefined) {
        if (index < result.length) {
          result[index] = mergeDeep(result[index], item, transform);
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
            (result as any)[key] = mergeDeep(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (result as any)[key],

              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (source as any)[key],
              transform
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

  // For primitive values, source overwrites target
  return transform ? transform(source) : source;
};
