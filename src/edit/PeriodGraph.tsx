import { useMemo, useState } from "react";
import { RangeNumberRule, Vector2 } from "../fractals/types";
import { Graph } from "./Graph/Graph";
import { makeNumberFromRangeRule } from "../ruleConversion";
import { useCurrentTime } from "./store/data/useCurrentTime";

// Colors with great constast with black background in rgba with high alpha
const colorsArray = [
  "rgba(255, 0, 0, 0.5)",
  "rgba(255, 165, 0, 0.5)",
  "rgba(255, 255, 0, 0.5)",
  "rgba(0, 128, 0, 0.5)",
  "rgba(0, 0, 255, 0.5)",
  "rgba(75, 0, 130, 0.5)",
  "rgba(238, 130, 238, 0.5)",
  "rgba(255, 192, 203, 0.5)",
  "rgba(165, 42, 42, 0.5)",
  "rgba(128, 128, 128, 0.5)",
  "rgba(0, 0, 0, 0.5)",
  "rgba(255, 255, 255, 0.5)",
  "rgba(0, 255, 255, 0.5)",
  "rgba(255, 0, 255, 0.5)",
  "rgba(50, 205, 50, 0.5)",
  "rgba(128, 0, 0, 0.5)",
  "rgba(0, 0, 128, 0.5)",
  "rgba(128, 128, 0, 0.5)",
  "rgba(0, 128, 128, 0.5)",
  "rgba(128, 0, 128, 0.5)",
];

export const PeriodGraph = ({
  rangeRules,
}: {
  rangeRules: RangeNumberRule[];
}) => {
  const time = useCurrentTime();
  const [width, setWidth] = useState<number | null>(null);

  const period = useMemo(() => {
    return rangeRules.reduce((acc, rule) => {
      return lowestCommonMultiple(acc, rule.cycleSeconds * 2 * 1000);
    }, 1);
  }, [rangeRules]);

  const data: [number[], string][] = useMemo(() => {
    if (!width || rangeRules.length === 0) {
      return [];
    }

    const allData: [number[], string][] = [];

    for (let i = 0; i < rangeRules.length; i++) {
      const rule = rangeRules[i];
      const ruleToCalc = { ...rule, range: [-1, 1] as Vector2 };
      const msPerPixel = period / width;

      const newData: number[] = [];

      for (let i = 0; i < Math.floor(width); i++) {
        newData.push(makeNumberFromRangeRule(ruleToCalc, i * msPerPixel));
      }

      allData.push([newData, colorsArray[i % colorsArray.length]]);
    }
    return allData;
  }, [width, rangeRules, period]);
  const msPerPixel = width ? period / width : 0;
  return (
    <div
      ref={(el) => {
        if (el) {
          setWidth(el.clientWidth);
        }
      }}
      style={{
        overflow: "hidden",
        position: "relative",
        height: 200,
      }}
    >
      <div
        style={{
          color: "white",
          backgroundColor: "black",
          position: "absolute",
          top: 10,
          left: 10,
          zIndex: 10,
        }}
      >
        Period {Math.round(period / 60000)} Minutes
      </div>
      {width && (
        <Graph
          cursorX={(time % period) / msPerPixel}
          width={width}
          max={1.1}
          data={data}
        />
      )}
    </div>
  );
};

const lowestCommonMultiple = (a: number, b: number): number => {
  const gcd = (x: number, y: number): number => {
    while (y) {
      [x, y] = [y, x % y];
    }
    return x;
  };
  return (a * b) / gcd(a, b);
};
