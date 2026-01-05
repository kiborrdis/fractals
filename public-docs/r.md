-- Short --

The boundary value beyond which a point is considered to have escaped to infinity. Typical values: 2-4.

-- Long --
# Escape Radius (r)

The escape radius defines the boundary beyond which a point is considered to have "escaped" to infinity during fractal iteration.

When iterating the formula, if $|z_n| > r$, the point escapes and the iteration stops. Typical values are 2-4, but larger values can reveal more detail in the fractal's outer regions.

Adjust with `rPerDistChange` for dynamic radius variations across the viewport.
