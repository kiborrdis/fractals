import { test, expect } from "@playwright/test";
import { renderFractalFrame } from "./renderFractalFrame";
import { getDefaultFractalRules } from "../src/features/fractals/getDefaultFractalRules";
import { COLORING_MODE_DEFAULT_GRADIENT, makeDefaultColoringEntry } from "../src/features/fractals/coloringDefaults";

// import { BlendMode, ColoringMode } from "../src/features/fractals";

test("FractalsRenderer renders one frame with FractalImage using default fractal rules", async ({
  page,
}) => {
  await page.goto("/");

  const buffer = await renderFractalFrame(page, getDefaultFractalRules(), [400, 400]);

  expect(buffer).toMatchSnapshot();
});


test("FractalsRenderer renders one frame with FractalImage using trap coloring", async ({
  page,
}) => {
  await page.goto("/");
  const rules = getDefaultFractalRules();
  rules.dynamic.coloring = [
    makeDefaultColoringEntry(3, 0),
  ]
  rules.gradients[0] = COLORING_MODE_DEFAULT_GRADIENT[3];

  const buffer = await renderFractalFrame(page, rules, [400, 400]);

  expect(buffer).toMatchSnapshot();
});

test("FractalsRenderer renders one frame with FractalImage using border coloring", async ({
  page,
}) => {
  await page.goto("/");
  const rules = getDefaultFractalRules();
  rules.dynamic.coloring = [
    makeDefaultColoringEntry(2, 0),
  ];
  rules.gradients[0] = COLORING_MODE_DEFAULT_GRADIENT[2];

  const buffer = await renderFractalFrame(page, rules, [400, 400]);

  expect(buffer).toMatchSnapshot();
});

test("FractalsRenderer renders one frame with FractalImage using normal coloring", async ({
  page,
}) => {
  await page.goto("/");
  const rules = getDefaultFractalRules();
  rules.dynamic.coloring = [
    makeDefaultColoringEntry(40, 0),
  ];
  rules.gradients[0] = COLORING_MODE_DEFAULT_GRADIENT[40];

  const buffer = await renderFractalFrame(page, rules, [400, 400]);

  expect(buffer).toMatchSnapshot();
});