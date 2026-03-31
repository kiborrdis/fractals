import { test, expect } from "@playwright/test";
import { renderFractalFrame } from "./renderFractalFrame";
import { getDefaultFractalRules } from "../src/features/fractals/getDefaultFractalRules";
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
  rules.coloring = [
    { type: 3, blend: 1 },
  ]

  const buffer = await renderFractalFrame(page, rules, [400, 400]);

  expect(buffer).toMatchSnapshot();
});

test("FractalsRenderer renders one frame with FractalImage using border coloring", async ({
  page,
}) => {
  await page.goto("/");
  const rules = getDefaultFractalRules();
  rules.coloring = [
    { type: 2, blend: 1 },
  ];

  const buffer = await renderFractalFrame(page, rules, [400, 400]);

  expect(buffer).toMatchSnapshot();
});

test("FractalsRenderer renders one frame with FractalImage using normal coloring", async ({
  page,
}) => {
  await page.goto("/");
  const rules = getDefaultFractalRules();
  rules.coloring = [
    { type: 40, blend: 1 },
  ];

  const buffer = await renderFractalFrame(page, rules, [400, 400]);

  expect(buffer).toMatchSnapshot();
});