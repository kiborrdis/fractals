-- Short --

Define separate rules for X and Y components instead of as a single 2D vector.

-- Long --
# Separate Vector Rule

Allows defining animation rules separately for the X and Y components of a 2D vector parameter.

Instead of defining the real and imaginary components of a complex number as a single unit, you can set independent rules for each axis. This gives more flexibility - for example, animate the real component with a spline while the imaginary component uses a step rule.

Useful when you want each axis of a 2D parameter to behave differently over time.
