---
name: fractal-param-add
description: Add a new parameter to the fractal configuration.
---

Here is a context for adding a new parameter to the fractal configuration:

Places where the new parameter should be added:
- feature/fractal/types contains the type definition for the fractal. "dynamic" key is key where animated parameters are defined, tho you can also define static number parameters there.
- Dynamic params types are located in shared/libs/numberRule. And can be numbers, vectors or array of numbers of vectors. Animated numbers or vectors described as a "rule" which is as an object(see numberRule lib)
- Static params are defined at the root of the fractal type definition
- Params are used in a shader. Depending on a param it's either fractalfragment.glsl which is calculating various fractal values for a pixel, or colorshader.glsl which is calculating the color of a pixel based on the fractal values
- To pass fractal params from the type definition to the shader you need to define it in prepareFractalUniforms file. Use the existing params as an example, or see libs/webgl/uniforms to look at the applier lib
- To add param to the UI, first change StaticRuleEdit or DynamicRuleEdit. You can define what kind of component to use to edit this param. And then add the component with proper key as param to layout. Usually to find a place to add you can start looking from SidebarSettings file which is where the most parameters are live in the UI.