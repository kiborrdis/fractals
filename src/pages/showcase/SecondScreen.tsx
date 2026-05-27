import { DisplayFractal, FractalParamsBuildRules } from "@/features/fractals";
import styles from "./SecondScreen.module.css";
import { useMemo, useState } from "react";
import { exampleFractal } from "./exampleFractal";
import { makeRuleFromNumber } from "@/shared/libs/numberRule";
import { GradientLine } from "./GradientLine";

const DisplayExampleFractal = ({
  maxIterations,
  fractal,
}: {
  maxIterations: number;
  fractal: FractalParamsBuildRules;
}) => {
  const updatedParams = useMemo(() => {
    return {
      ...fractal,
      dynamic: {
        ...fractal.dynamic,
        maxIterations: makeRuleFromNumber(maxIterations),
      },
    };
  }, [fractal, maxIterations]);

  return <DisplayFractal params={updatedParams} play={false} />;
};

const SecondScreen = () => {
  const maxIter =
    exampleFractal.gradients[0][exampleFractal.gradients[0].length - 1][0];
  const [maxIterations, setMaxIterations] = useState(40);

  return (
    <div className={styles.secondScreen}>
      <div className={styles.secondScreenLeft}>
        <DisplayExampleFractal
          maxIterations={maxIterations}
          fractal={exampleFractal}
        />
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
              gradient={exampleFractal.gradients[0]}
              maxIterations={maxIter}
              currentIteration={maxIterations}
              minValue={1}
              maxValue={maxIter}
              onChange={setMaxIterations}
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
