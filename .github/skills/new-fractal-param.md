---
name: fractal-param-add
description: Add a new parameter to the fractal configuration.
---

Here is a context for adding a new parameter to the fractal configuration:

Places where the new parameter should be added:
- feature/fractal/types contains the type definition for the fractal. "dynamic" key is key where animated parameters are defined, tho you can also define static number parameters there.
- Dynamic params types are located in shared/libs/numberRule. And can be numbers, vectors or array  of vectors. Animated numbers or vectors described as a "rule" which is an object(see numberRule lib)
- Static params are defined at the root of the fractal type definition
- Params are used in a shader. Depending on a param it's either fractalfragment.glsl which is calculating various fractal values for a pixel, or colorshader.glsl which is calculating the color of a pixel based on the fractal values
- To pass fractal params from the type definition to the shader you need to define it in prepareFractalUniforms file. Use the existing params as an example, or see libs/webgl/uniforms to look at the applier lib
- To add param to the UI, if it's not coloring param, first change `StaticRuleEdit` or `DynamicRuleEdit`. You can define what kind of component to use to edit this param. And then add the component with proper key as param to layout. Usually to find a place to add you can start looking from SidebarSettings file which is where the most parameters are live in the UI.

## Working with Coloring Params

`dynamic.coloring` is an array of coloring layers. Each layer is a `ColoringBuildRule` tuple `[mode, gradientIds[], params: NumberBuildRule[], blendMode]`. Per-mode tuple types (e.g. `TrapColoringBuildRule`) are defined in `src/features/fractals/types.ts`.

Gradients are stored separately in `fractal.gradients: GradientStop[][]`; `entry[1]` holds indexes into that array. On add, new gradients are appended; on remove, they are spliced out and remaining IDs are decremented.

In components, use `useColoringRules()` for the full array or `useColoringEntry(index)` for a single entry (both from `editStore/data/useColoringRules.ts`). Don't access the store directly. Mutations go through `useActions()`: `addColoringMode`, `removeColoringMode`, `replaceColoringMode`, `editColoringParams`, `editColoringBlend`, `moveColoringLayer`.

Defaults live in `src/features/fractals/coloringDefaults.ts`: `COLORING_MODE_GRADIENT_COUNT`, `COLORING_MODE_DEFAULT_PARAMS`, `COLORING_MODE_DEFAULT_GRADIENT` (per-mode gradient stops), and `makeDefaultColoringEntry(mode, gradientStartIndex)`.

To add a new coloring mode: add it to the `ColoringMode` enum and define its `*ColoringBuildRule` type in `types.ts`, add entries to all constants in `coloringDefaults.ts`, handle it in `prepareFractalUniforms.ts` and the color shader, then add a `*ColoringSettings.tsx` component wired into `ColoringLayersAccordion.tsx` and `ColoringSettings.tsx`.

To add a param to an existing mode: extend the tuple type, add a default to `COLORING_MODE_DEFAULT_PARAMS`, update the shader, and add a `NumberRuleEdit` calling `editColoringParams(coloringIndex, paramIndex, rule)`.