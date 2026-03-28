-- Short --

Separate color gradient for mapping orbit trap distances to colors. Position stops correspond to distance values rather than iteration counts.

-- Long --
# Trap Gradient

A dedicated gradient editor for trap coloring, mapping the minimum distance to trap shapes into colors. Unlike the main iteration gradient where stop positions represent iteration counts, here positions correspond to distance values.

## How It Works

During fractal iteration, the minimum distance from the orbit to each trap shape is tracked. This distance is then scaled by the trap distance multiplier and mapped through this gradient to produce the final trap color.

## Editing

Add, remove, and reposition color stops to define how distances map to colors. Stops closer to zero represent points very near the trap shapes, while stops at higher positions represent points farther away.

Preset gradients and auto-generation are available from the actions menu. This gradient is only active when trap coloring is enabled and at least one trap shape is defined.
