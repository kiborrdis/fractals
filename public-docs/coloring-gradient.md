-- Short --

Colors the fractal by mapping iteration counts to a color gradient. The primary coloring method for creating vibrant fractal images.

-- Long --
# Gradient Coloring

The default coloring method that maps how quickly each point escapes to infinity (iteration count) to a color gradient. This creates the characteristic vibrant bands and smooth color transitions that make fractals visually striking.

## Settings

- **Gradient:** Define color stops to create your palette. Each stop has a position (iteration value) and color. Add, remove, or reposition stops to design custom gradients. Preset gradients are also available.
- **Band Smoothing:** Controls the smoothness of color transitions. Negative values create sharp, distinct color bands. Positive values produce smooth, blended gradients.

## How It Works

Points that escape quickly get colors from the beginning of the gradient, while points that take longer to escape get colors further along. Points that never escape (inside the set) are typically rendered black.

Enable this coloring method from the Coloring section in the sidebar settings.
