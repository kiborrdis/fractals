import { NVectorStepRule } from "@/shared/libs/numberRule";
import { useMemo } from "react";

const colors: [number, number, number][] = [
  [59, 130, 246], // Vibrant Blue
  [6, 182, 212], // Cyan
  [34, 197, 94], // Fresh Green
  [251, 146, 60], // Warm Orange
  [236, 72, 153], // Soft Pink/Magenta
];

const getDefaultColor = (index: number, len: number): string => {
  const colorIndex = Math.floor((index / len) * colors.length);
  const indexesBetweenColors = len / colors.length;
  const part =
    (index - colorIndex * indexesBetweenColors) / indexesBetweenColors;

  const interpolatedColor = colors[colorIndex % colors.length].map((c, i) => {
    const nextColor = colors[(colorIndex + 1) % colors.length][i];
    return Math.round(c + (nextColor - c) * part);
  });

  return `rgb(${interpolatedColor[0]}, ${interpolatedColor[1]}, ${interpolatedColor[2]})`;
};

export const useGraphColor = ({
  quant,
  rule,
  selectedStepIndex,
}: {
  quant: number;
  rule: NVectorStepRule<2>;
  selectedStepIndex: number | null;
}) => {
  const getColor = useMemo(() => {
    if (selectedStepIndex === null) {
      return getDefaultColor;
    }

    const timeOfStepStart =
      rule.transitions
        .slice(0, selectedStepIndex)
        .reduce((m, t) => m + t.len, 0) * 1000;
    const timeOfStepEnd =
      timeOfStepStart + rule.transitions[selectedStepIndex].len * 1000;

    const indexOfStepStart = Math.ceil(timeOfStepStart / quant);
    const indexOfStepEnd = Math.floor(timeOfStepEnd / quant);

    return (index: number, len: number): string => {
      if (index >= indexOfStepStart && index <= indexOfStepEnd) {
        return `rgba(255, 205, 124, 1)`;
      }

      return getDefaultColor(index, len);
    };
  }, [quant, selectedStepIndex, rule.transitions]);

  return getColor;
};
