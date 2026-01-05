import { GradientStop } from "@/features/fractals";

export type DistributionType = "linear" | "exponential";

export const distributeStops = (
  stops: GradientStop[],
  maxValue: number,
  type: DistributionType,
): GradientStop[] => {
  const sortedStops = [...stops].sort((a, b) => a[0] - b[0]);
  const count = sortedStops.length;

  if (count < 2) {
    return sortedStops;
  }

  return sortedStops.map((stop, index) => {
    let position: number;

    if (type === "linear") {
      position = (maxValue * index) / (count - 1);
    } else {
      const normalizedIndex = index / (count - 1);
      const exponentialValue = (Math.exp(normalizedIndex) - 1) / (Math.E - 1);
      position = maxValue * exponentialValue;
    }

    return [position, stop[1], stop[2], stop[3], stop[4]] as GradientStop;
  });
};
