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
  // Handle null/undefined cases
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

  // Handle objects
  if (
    typeof target === "object" &&
    typeof source === "object" &&
    !Array.isArray(target) &&
    !Array.isArray(source)
  ) {
    const result = { ...target };

    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        if (source[key] !== undefined) {
          if (key in result) {
            result[key] = mergeDeep(result[key], source[key], transform);
          } else {
            result[key] = transform ? transform(source[key]) : source[key];
          }
        }
      }
    }

    return result;
  }

  // For primitive values, source overwrites target
  return transform ? transform(source) : source;
};
