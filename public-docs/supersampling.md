-- Short --

Anti-aliasing quality level. Renders multiple samples per pixel and averages them for smoother edges. Higher values = better quality but slower. Options: 1x (off), 4x, 8x, 16x, 32x.

-- Long --
# Supersampling (Anti-Aliasing)

Supersampling improves render quality by evaluating the fractal formula multiple times per pixel at different sub-pixel positions, then averaging the results. This eliminates jagged edges and visual artifacts at fractal boundaries.

## Quality Levels

| Level | Samples per Pixel | Description |
|-------|-------------------|-------------|
| 1x | 1 | No anti-aliasing (fastest) |
| 4x | 4 | Light smoothing (2×2 grid) |
| 8x | 8 | Moderate smoothing |
| 16x | 16 | High quality (4×4 grid) |
| 32x | 32 | Maximum quality (slowest) |

Higher levels produce noticeably smoother images but take proportionally longer to render. For real-time preview, 1x or 4x is recommended. Use 16x or 32x for final exports or screenshots.
