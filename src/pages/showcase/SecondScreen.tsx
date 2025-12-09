import { FractalParamsBuildRules } from "@/features/fractals";
import styles from "./SecondScreen.module.css";
import { useEffect, useRef, useState } from "react";
import { createFractalVisualizer } from "@/features/fractals/fractals";
import { DisplayCanvas } from "@/shared/ui/DisplayCanvas/DisplayCanvas";
import { exampleFractal } from "./exampleFractal";
import {
  extractMaxValueFromRule,
  makeNumberFromRangeRule,
  RuleType,
} from "@/shared/libs/numberRule";
import { GradientLine } from "./GradientLine";

const DisplayExampleFractal = ({
  time,
  fractal,
}: {
  time: number;
  fractal: FractalParamsBuildRules;
}) => {
  const [[width, height], setSize] = useState([0, 0]);
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const visualizerRef = useRef<{
    resize: (newSize: [number, number]) => void;
    loop: {
      stop: () => void;
      run: () => void;
      setCurrentTime: (time: number) => void;
    };
  } | null>(null);

  useEffect(() => {
    if (!canvas) {
      return;
    }

    const visializer = createFractalVisualizer(
      canvas,
      [width, height],
      fractal,
      { play: false, time: 0, timeMultiplier: 1 },
    );
    visualizerRef.current = visializer;
    return () => {
      visializer.loop.stop();
    };
    // This is intentional, only recreate visualizer if new canvas element
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvas]);

  useEffect(() => {
    if (visualizerRef.current) {
      visualizerRef.current.resize([width, height]);
    }
  }, [width, height]);

  useEffect(() => {
    if (visualizerRef.current) {
      visualizerRef.current.loop.setCurrentTime(time);
    }
  }, [time]);

  return (
    <DisplayCanvas
      ref={setCanvas}
      width={width === 0 ? undefined : width}
      height={height === 0 ? undefined : height}
      onSizeChange={setSize}
    />
  );
};

const SecondScreen = () => {
  const [time, setTime] = useState(0);
  const fractalInitialTime = exampleFractal.initialTime ?? 0;
  const minTime = -fractalInitialTime;
  const maxTime =
    exampleFractal.dynamic.maxIterations.t === RuleType.StepNumber
      ? exampleFractal.dynamic.maxIterations.transitions.reduce(
          (sum, rule) => sum + rule.len * 1000,
          -1 - fractalInitialTime,
        )
      : 1000;
  const maxIter = extractMaxValueFromRule(exampleFractal.dynamic.maxIterations);

  return (
    <div className={styles.secondScreen}>
      <div className={styles.secondScreenLeft}>
        <DisplayExampleFractal time={time} fractal={exampleFractal} />
      </div>
      <div className={styles.secondScreenRight}>
        <div className={styles.secondScreenContent}>
          <h2>What are Escape Time Fractals?</h2>

          <p></p>
          <p>
            Escape time fractals determine the color of each pixel based on how
            quickly the recursive formula &ldquo;escapes&rdquo; to infinity.
            Points that never escape form the fractal set and are colored to
            highlight their structure.
          </p>
          <p>
            For each pixel, we calculate a recursive formula (like{" "}
            <code>
              z<sub>n</sub> = z<sub>n-1</sub>² + c
            </code>{" "}
            for the Julia set, where{" "}
            <code>
              z<sub>0</sub>
            </code>{" "}
            is pixel coordinates) until the magnitude of <code>z</code> reaches
            a bailout value, or we hit the maximum iteration limit. The
            resulting iteration count is used to color the pixel.
          </p>

          <p className={styles.demonstrationContent}>
            Use the slider below to change the maximum iterations. More
            iterations reveal finer details and deeper structures.
          </p>
          <div className={styles.demonstrationContent}>
            <GradientLine
              gradient={exampleFractal.gradient}
              maxIterations={maxIter}
              currentIteration={makeNumberFromRangeRule(
                exampleFractal.dynamic.maxIterations,
                time + fractalInitialTime,
              )}
              minValue={minTime}
              maxValue={maxTime}
              onChange={setTime}
            />
          </div>
          <p>
            By tweaking formulas, parameters, and coloring schemes, you can
            create infinite varieties of intricate, self-similar patterns.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SecondScreen;
