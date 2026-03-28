-- Short --

Scales the escape distance before applying border coloring. Higher values create sharper, more visible borders. Range: 0–1,000,000.

-- Long --
# Border Distance Multiplier

Controls how aggressively the distance estimation effect is applied to border coloring. The calculated escape distance is multiplied by this value and clamped to determine the final border color intensity.

## Effect

- **Higher values:** Sharp, well-defined borders with strong contrast.
- **Lower values:** Soft, diffuse glow that fades gradually from the boundary.
- **Default:** 25

## Range

0 to 1,000,000. Adjust to balance between subtle glow and crisp outlines. The visual result depends on the fractal's boundary complexity and zoom level.
