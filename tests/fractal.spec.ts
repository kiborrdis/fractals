import { test, expect } from "@playwright/test";
import { renderFractalFrame } from "./renderFractalFrame";
import { getDefaultFractalRules } from "../src/features/fractals/getDefaultFractalRules";

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
  rules.trapColoringEnabled = true;
  rules.gradientColoringEnabled = false;

  const buffer = await renderFractalFrame(page, rules, [400, 400]);

  expect(buffer).toMatchSnapshot();
});

test("FractalsRenderer renders one frame with FractalImage using border coloring", async ({
  page,
}) => {
  await page.goto("/");
  const rules = getDefaultFractalRules();
  rules.borderColoringEnabled = true;
  rules.gradientColoringEnabled = false;

  const buffer = await renderFractalFrame(page, rules, [400, 400]);

  expect(buffer).toMatchSnapshot();
});