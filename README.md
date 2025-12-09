# Fractal Playground

🌐 **[Live Demo](https://fractals.lightless.work)** — Explore fractals in real-time!

A real-time, interactive fractal visualization and editing application built with WebGL2 and React. Create, animate, and share beautiful mathematical fractals with custom formulas and color gradients.

## ✨ Features

- **Custom Fractal Formulas** — Write mathematical expressions like `z^2 + c`, `sin(z)^2 + z^-1 + c`, or any complex formula
- **Real-time WebGL2 Rendering** — Hardware-accelerated GPU rendering
- **Animated Parameters** — Animate any parameter over time with cycling ranges, keyframes, and easing functions
- **Mirroring Effects** — Apply hex, square, or radial symmetry transformations
- **Custom Gradients** — Design your own color schemes with multiple gradient stops
- **Shareable URLs** — Every fractal configuration is encoded in the URL for instant sharing

## Getting Started

### Prerequisites

- Node.js 18+ 
- Yarn or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/kiborrdis/fractals.git
cd fractals

# Install dependencies
yarn install

# Start the development server
yarn dev
```

The app will be available at `http://localhost:5173`

## 📖 Formula Syntax

Fractals are defined by iterative formulas operating on complex numbers. The formula determines how each point in the complex plane evolves.

### Variables

| Variable | Description |
|----------|-------------|
| `z` | Current complex value (iterates each step) |
| `c` | Complex constant (typically the pixel coordinate) |

### Operators

| Operator | Description |
|----------|-------------|
| `+`, `-`, `*`, `/` | Basic arithmetic |
| `^` | Power (e.g., `z^2`, `z^-1`) |

### Functions

| Function | Description | Example |
|----------|-------------|---------|
| `sin(z)` | Complex sine | `sin(z)^2 + c` |
| `cos(z)` | Complex cosine | `cos(z) + c` |
| `tan(z)` | Complex tangent | `tan(z)^2 + c` |
| `sinh(z)` | Hyperbolic sine | `sinh(z) + c` |
| `cosh(z)` | Hyperbolic cosine | `cosh(z) + c` |
| `asin(z)` | Arc sine | `asin(z) + c` |
| `acos(z)` | Arc cosine | `acos(z) + c` |
| `exp(z)` | Complex exponential | `exp(z) + c` |
| `PLog(z)` | Principal logarithm | `PLog(z^2) + c` |
| `re(z)` | Real part (returns number) | `re(z) + c` |
| `im(z)` | Imaginary part (returns number) | `im(z) + c` |
| `cmpl(a, b)` | Create complex from reals | `cmpl(im(z), re(z))` |
| `abs(n)` | Absolute value (number) | `abs(re(z))` |
| `rotate(z, θ)` | Rotate by angle θ | `rotate(z, 0.5)` |
| `conjugate(z)` | Complex conjugate | `conjugate(z) + c` |

### Example Formulas

```
z^2 + c                          # Classic Mandelbrot
z^2 + z^-2/10 + c                # Burning ship variant
sin(z)^2 + z^-1 + c              # Trigonometric fractal
1/(1-z^-2)^2 + c                 # If you now how to name it, please make PR
PLog(sin(z^2))^-2 + c            # Something with principal log
swap*(z^2) + (1-swap)*sin(z)^2 + c  # Morphing between fractals
```

## Editor Features

### Animation System

Parameters can be animated using different rule types:

- **Static** — Fixed value
- **Range** — Oscillates between min/max over a cycle period
- **Step** — Keyframe-based animation with customizable easing between steps

### Mirroring Modes

| Mode | Description |
|------|-------------|
| `off` | No mirroring |
| `square` | 4-fold square symmetry |
| `hex` | 6-fold hexagonal symmetry |
| `radial` | Radial/rotational symmetry |

### Custom Variables

Define your own variables (like `swap` in the examples) and animate them independently. This enables smooth morphing between different fractal types.

## URL Sharing

Fractal configurations are serialized to base64 and stored in the URL query parameter `s`. This means:

- Every fractal has a unique, shareable URL
- No backend required for sharing
- Bookmarkable states
- Browser history navigation works

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

This project was inspired by and built upon knowledge from:

- **[Inigo Quilez's Smooth Mandelbrot Article](https://iquilezles.org/articles/msetsmooth/)** — Band smoothing for fractal coloring
- **[Julia Set Mathematics](https://en.wikipedia.org/wiki/Julia_set)** — Mathematical foundation for fractal iteration
