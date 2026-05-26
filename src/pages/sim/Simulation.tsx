import { getDefaultFractalRules } from "@/features/fractals";
import { FractalsRenderer } from "@/features/fractals/shader/FractalsRenderer";
import { FractalMapImage } from "@/features/fractals/shader/FractaMapImage";
import { RuleType } from "@/shared/libs/numberRule";
import { DisplayCanvas } from "@/shared/ui/DisplayCanvas/DisplayCanvas";
import { NumberInput, Stack } from "@mantine/core";
import { useEffect, useRef, useState } from "react";

const params = getDefaultFractalRules();

export const DisplayFractal = () => {
  const [[width, height], setSize] = useState([0, 0]);
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const fractalMapRef = useRef<FractalMapImage | null>(null);
  const fractalRef = useRef<FractalsRenderer | null>(null);
  const contextRef = useRef<WebGL2RenderingContext | null>(null);

  const [samples, setSamples] = useState(1);

  useEffect(() => {
    if (!canvas) {
      return;
    }

    if (!contextRef.current) {
      contextRef.current = canvas.getContext("webgl2", { antialias: true });
    }

    const context = contextRef.current;

    if (!context) {
      console.error("WebGL2 context initialization failed");
      return;
    }

    params.formula = "z^4 - z^-2/20 + sin(z/10) + zp + c";
    params.dynamic.maxIterations = {
      t: RuleType.StaticNumber,
      value: 30,
    };
    params.gradients = [
      [
        [0, [0, 0, 0, 1]],
        [3, [0, 0.1, 0, 1]],
        [9, [0, 0.2, 0, 1]],
        [12, [0.8, 0.7, 0, 1]],
        [21, [0, 0.8, 0, 1]],
        [29, [0, 0, 1, 1]],
        [30, [0, 0, 1, 1]],
      ],
    ];

    const fractalMap = new FractalMapImage(context, params, {
      axisSizes: [4, 4],
      offset: [0, 0],
      targetDetailLevel: samples,
    });
    fractalMapRef.current = fractalMap;
    const renderer = new FractalsRenderer(
      context,
      [width, height],
      [[fractalMap]],
    );
    renderer.render(0, { offset: [0, 0], scale: 1 });
    fractalRef.current = renderer;

    return () => {
      renderer.cleanup();
    };
    // This is intentional, only recreate visualizer if new canvas element or formula
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvas, width, height]);

  useEffect(() => {
    if (!fractalMapRef.current || !fractalRef.current) {
      return;
    }

    fractalMapRef.current.updateMapParams({
      axisSizes: [4, 4],
      offset: [0, 0],
      targetDetailLevel: samples,
    });
    fractalRef.current.render(0, { offset: [0, 0], scale: 1 }).then((time) => {
      console.log("U Render time:", time);
    });
  }, [samples]);

  return (
    <Stack gap='md'>
      <NumberInput value={samples} onChange={(v) => setSamples(Number(v))} />
      <div style={{ position: "relative", width: 400, height: 300 }}>
        <DisplayCanvas
          ref={setCanvas}
          width={width === 0 ? undefined : width}
          height={height === 0 ? undefined : height}
          onSizeChange={setSize}
        />
      </div>
    </Stack>
  );
};

export const Simulation = () => {
  return <DisplayFractal />;
};
