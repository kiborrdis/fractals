-- Short --

Colors the fractal based on distance to the escape boundary using distance estimation. Creates glowing edge effects around the fractal set.

-- Long --
# Border Coloring

Colors pixels based on their estimated distance to the boundary of the fractal set, creating glowing or outlined edge effects. Uses exterior distance estimation to calculate how far each point is from the fractal boundary.

## Settings

- **Border Color:** The base color used for the border effect (default: white).
- **Border Distance Multiplier:** Controls the intensity of the distance effect. Higher values create sharper, more visible borders. Lower values produce a subtle, diffuse glow. Range: 0–1,000,000 (default: 25).

## How It Works

The shader calculates the escape distance for each point using the derivative of the iteration formula. Points closer to the boundary get brighter colors, creating a natural glow or outline effect around the fractal set.

Enable this coloring method from the Coloring section in the sidebar settings. It can be blended with other coloring methods (gradient, trap) using blend modes like Normal, Add, Multiply, or Screen.
