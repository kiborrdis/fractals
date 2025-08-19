import { useEffect, useRef, useState } from "react";
import {
  createStaticFractalVisualizer,
  StaticFractalVisualizerControls,
} from "./fractals/fractals";
import { FractalParamsBuildRules } from "./fractals/types";
import { DisplayCanvas } from "./DisplayCanvas/DisplayCanvas";

export const DisplayFractal = ({
  params,
  play,
}: {
  params: FractalParamsBuildRules;
  play: boolean;
}) => {
  const [[width, height], setSize] = useState([800, 600]);

  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const fractalRef = useRef<StaticFractalVisualizerControls | null>(null);

  useEffect(() => {
    if (!canvas) {
      return;
    }
    const newVisualizer = createStaticFractalVisualizer(
      canvas,
      [width, height],
      params
    );
    fractalRef.current = newVisualizer;

    if (!play) {
      newVisualizer.loop.stop();
    }

    return () => {
      newVisualizer.loop.stop();
    };
  }, [canvas]);

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
      width={width}
      height={height}
      onSizeChange={setSize}
    />
  );
};
