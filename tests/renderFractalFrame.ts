import type { Page } from "@playwright/test";
import type { FractalParamsBuildRules } from "../src/features/fractals/types";
import type { Vector2 } from "../src/shared/libs/vectors";

export async function renderFractalFrame(
  page: Page,
  rules: FractalParamsBuildRules,
  size: Vector2,
): Promise<Buffer> {
  const dataUrl = await page.evaluate(
    async ({ rules, size }) => {
      const [{ FractalsRenderer }, { FractalImage }] = await Promise.all([
        import("/src/features/fractals/shader/FractalsRenderer.ts"),
        import("/src/features/fractals/shader/FractalImage.ts"),
      ]);

      const canvas = document.createElement("canvas");
      canvas.width = size[0];
      canvas.height = size[1];
      document.body.appendChild(canvas);

      const context = canvas.getContext("webgl2", {
        preserveDrawingBuffer: true,
      });
      if (!context) throw new Error("WebGL2 not available");

      const fractalImage = new FractalImage(context, rules);
      const renderer = new FractalsRenderer(context, size, [[fractalImage]]);

      await renderer.render(0, { offset: [0, 0], scale: 1 }, true);

      return canvas.toDataURL("image/png");
    },
    { rules, size },
  );

  const base64 = dataUrl.replace(/^data:image\/png;base64,/, "");
  return Buffer.from(base64, "base64");
}
