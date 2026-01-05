-- Short --

The mathematical expression that defines fractal iteration. Classic: `z^2 + c`

-- Long --
# Fractal Formula

The mathematical expression that defines how the fractal iterates: $z_{n+1} = f(z_n, c)$

The classic Mandelbrot/Julia formula is `z^2 + c`, but you can create infinite variations using different functions like `z^3 + c`, `sin(z) + c`, or complex combinations.

Each formula produces uniquely different fractal structures and patterns.


## Built-in Variables

- **`z`** - The current iteration value (complex number)
- **`c`** - The complex constant parameter (complex number)

## Trigonometric Functions (Complex)

- **`sin(z)`** - Sine (works with complex numbers)
- **`cos(z)`** - Cosine (works with complex numbers)
- **`tan(z)`** - Tangent (works with complex numbers)
- **`asin(z)`** - Arcsine (works with complex numbers)
- **`acos(z)`** - Arccosine (works with complex numbers)

## Hyperbolic Functions (Complex)

- **`sinh(z)`** - Hyperbolic sine
- **`cosh(z)`** - Hyperbolic cosine

## Exponential and Logarithmic

- **`exp(z)`** - Exponential ($e^z$)
- **`PLog(z)`** - Complex logarithm (principal branch)

## Complex Number Manipulation

- **`cmpl(real, imag)`** - Create complex number from real and imaginary parts
- **`re(z)`** - Extract real component
- **`im(z)`** - Extract imaginary component
- **`conjugate(z)`** - Complex conjugate ($\overline{z}$)
- **`abs(n)`** - Absolute value of a number
- **`rotate(z, angle)`** - Rotate complex number by angle (radians)
- **`mirror(z)`** - Mirror/reflect complex number

## Operators

- **`+`** - Addition
- **`-`** - Subtraction
- **`*`** - Multiplication
- **`/`** - Division
- **`^`** - Power/Exponentiation
- **`()`** - Parentheses for grouping

## Examples

```
z^2 + c                    // Classic Mandelbrot
z^3 + c                    // Cubic variant
sin(z) + c                 // Trigonometric
z^2 + c * sin(time)        // Animated constant
cmpl(re(c), im(c)^2)       // Manipulate components
exp(z) + c                 // Exponential growth
```

## Notes

- Complex numbers support all standard operations automatically
- Functions work with both real and complex inputs
- Use custom variables to parameterize your formulas
- Reference `time` to create time-based animations
