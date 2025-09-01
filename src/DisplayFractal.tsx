import { useEffect, useRef, useState } from "react";
import {
  createFractalVisualizer,
  StaticFractalVisualizerControls,
} from "./fractals/fractals";
import { FractalParamsBuildRules } from "./fractals/types";
import { DisplayCanvas } from "./DisplayCanvas/DisplayCanvas";
import { throttle } from "./utils";

export const DisplayFractal = ({
  params,
  play,
  formula = 'z*z + c',
  timeMultiplier = 1,
  onRender
}: {
  params: FractalParamsBuildRules;
  play: boolean;
  formula?: string;
  timeMultiplier?: number;
  onRender?: (time: number) => void;
}) => {
  const [[width, height], setSize] = useState([0, 0]);
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const fractalRef = useRef<StaticFractalVisualizerControls | null>(null);

  if (fractalRef.current) {
    fractalRef.current.loop.setTimemultiplier(timeMultiplier);
  }

  useEffect(() => {
    if (!canvas) {
      return;
    }
    const throttledOnRender = onRender ? throttle(onRender, 50) : undefined;

    const newVisualizer = createFractalVisualizer(
      formula,
      canvas,
      [width, height],
      params,
      throttledOnRender
    );
    fractalRef.current = newVisualizer;

    if (!play) {
      newVisualizer.loop.stop();
    }

    return () => {
      newVisualizer.loop.stop();
    };
  // This is intentional, only recreate visualizer if new canvas element or formula
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvas, formula, onRender]);

  useEffect(() => {
    if (fractalRef.current) {
      fractalRef.current.resize([width, height]);
    }
  }, [width, height]);

  useEffect(() => {
    if (fractalRef.current) {
      fractalRef.current.updateParams(params);
    }
  }, [params]);

  useEffect(() => {
    if (fractalRef.current) {
      if (play) {
        fractalRef.current.loop.run();
      } else {
        fractalRef.current.loop.stop();
      }
    }
  }, [play]);

  return (
    <DisplayCanvas
      ref={setCanvas}
      width={width === 0 ? undefined : width}
      height={height === 0 ? undefined : height}
      onSizeChange={setSize}
    />
  );
};

