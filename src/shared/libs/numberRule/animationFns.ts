import { StepTransitionFnType, StepTransitionFn } from "./types";

export const animationFns: {
  [K in StepTransitionFnType]: (
    t: number,
    d: Extract<StepTransitionFn, { t: K }>["data"],
  ) => number;
} = {
  linear: (t) => t,
  t: (t) => Math.pow(t, 2) * Math.sin((Math.PI * 17 * t) / 2),
  easeInSine: (t) => 1 - Math.cos((t * Math.PI) / 2),
  easeOutSine: (t) => Math.sin((t * Math.PI) / 2),
  easeInOutSine: (t) => -((Math.cos(Math.PI * t) - 1) / 2),
  easeInOutElastic: (t) => {
    const c5 = (2 * Math.PI) / 4.5;

    return t === 0
      ? 0
      : t === 1
        ? 1
        : t < 0.5
          ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2
          : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 +
            1;
  },
};
