import { useEffect, useRef, useState } from "react";
import {
  createStaticFractalVisualizer,
  StaticFractalVisualizerControls,
} from "./fractals/fractals";
import { FractalParamsBuildRules } from "./fractals/types";
import { DisplayCanvas } from "./DisplayCanvas/DisplayCanvas";
import { throttle } from "./utils";

export const DisplayFractal = ({
  params,
  play,
  onRender
}: {
  params: FractalParamsBuildRules;
  play: boolean;
  onRender?: (time: number) => void;
}) => {
  const [[width, height], setSize] = useState([800, 600]);

  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const fractalRef = useRef<StaticFractalVisualizerControls | null>(null);

  useEffect(() => {
    if (!canvas) {
      return;
    }
    const throttledOnRender = onRender ? throttle(onRender, 250) : undefined;

    const newVisualizer = createStaticFractalVisualizer(
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
  }, [canvas, onRender]);

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

