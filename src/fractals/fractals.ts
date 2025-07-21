// import { JuliaSet, JuliaSetRenderer } from "./JuliaSetRenderer";
import { randomRange } from "./utils";

import { createRenderLoop } from "./renderLoop";
// import { workers } from "../App";
import vertex from "./vertexshader.glsl?raw";
import fragment from "./fragmentshader.glsl?raw";

export {};

export type Vector2 = [number, number];
export type RGBAVector = [number, number, number, number];

// type RendererContext = {
//   maxCoords: Vector2 | undefined;
// };

// const width = 1000;
// const height = 600;

// const initialIterationNumber = 60;

// export const createFractalVisualizer = (
//   canvas: HTMLCanvasElement,
//   canvasSize: Vector2
// ) => {
//   const context = canvas.getContext("2d");

//   if (!context) {
//     throw new Error("2d context initialization failed");
//   }

//   context.fillRect(0, 0, ...canvasSize);

//   const renderer = new JuliaSetRenderer({
//     juliaSet: new JuliaSet({
//       c: [randomRange(-0.55, -0.53), randomRange(-0.55, -0.53)],
//       R: randomRange(80, 100),
//       midPoint: [0, 0],
//       maxIterations: initialIterationNumber,
//       screenSize: canvasSize,
//       scale: 0.01,
//     }),

//     maxIterations: initialIterationNumber,
//     screenSize: canvasSize,
//     colorConverter: createIterationsColorConverterFn(
//       [
//         [
//           randomRangeInt(0, 255),
//           randomRangeInt(0, 255),
//           randomRangeInt(0, 255),
//           255,
//         ],
//         [
//           randomRangeInt(0, 255),
//           randomRangeInt(0, 255),
//           randomRangeInt(0, 255),
//           255,
//         ],
//       ],
//       [
//         randomRangeInt(0, 255),
//         randomRangeInt(0, 255),
//         randomRangeInt(0, 255),
//         255,
//       ]
//     ),
//   });

//   let rendered = false;
//   const loop = createRenderLoop({
//     loopIterationCallback: async ({ timeDelta }) => {
//       if (true) {
//         const rand = Math.random();
//         console.time('render 1 ' + rand)
//         await render(context, [renderer]);
//         console.timeEnd('render 1 ' + rand);

//         rendered = true;
//       }
//     },
//   });

//   return loop;
// };

export const createFractalVisualizer = (
  canvas: HTMLCanvasElement,
  canvasSize: Vector2
) => {
  const context = canvas.getContext("webgl");

  if (!context) {
    throw new Error("2d context initialization failed");
  }

  const vertexShader = createShader(context, context.VERTEX_SHADER, vertex);
  const fragmentShader = createShader(
    context,
    context.FRAGMENT_SHADER,
    fragment
  );

  const shaderProgram = createProgram(context, vertexShader, fragmentShader);
  // context.fillRect(0, 0, ...canvasSize);

  if (!shaderProgram) {
    throw new Error("Shader program is undefined");
  }

  const positionAttributeLocation = context.getAttribLocation(
    shaderProgram,
    "a_position"
  );
  const resolutionUniformLocation = context.getUniformLocation(
    shaderProgram,
    "u_resolution"
  );

  const colorStartUniformLocation = context.getUniformLocation(
    shaderProgram,
    "u_color_start"
  );
  const colorEndUniformLocation = context.getUniformLocation(
    shaderProgram,
    "u_color_end"
  );
  const colorOverflowUniformLocation = context.getUniformLocation(
    shaderProgram,
    "u_color_overflow"
  );

  const fractalCLocation = context.getUniformLocation(
    shaderProgram,
    "u_fractal_c"
  );
  const fractalRLocation = context.getUniformLocation(
    shaderProgram,
    "u_fractal_r"
  );

  const fractalSepLocation = context.getUniformLocation(shaderProgram, "u_sep");
  const fractalTimeLocation = context.getUniformLocation(
    shaderProgram,
    "u_time"
  );

  const fractalRRangeStartLocation = context.getUniformLocation(
    shaderProgram,
    "u_fractal_r_range_start"
  );
  const fractalRRangeEndLocation = context.getUniformLocation(
    shaderProgram,
    "u_fractal_r_range_end"
  );

  const positionBuffer = context.createBuffer();

  context.bindBuffer(context.ARRAY_BUFFER, positionBuffer);

  const positions = [
    0,
    0,
    0,
    canvasSize[1],
    canvasSize[0],
    0,
    ...canvasSize,
    0,
    canvasSize[1],
    canvasSize[0],
    0,
  ];
  context.bufferData(
    context.ARRAY_BUFFER,
    new Float32Array(positions),
    context.STATIC_DRAW
  );

  // const renderer = new JuliaSetRenderer({
  //   juliaSet: new JuliaSet({
  //     c: [randomRange(-0.55, -0.53), randomRange(-0.55, -0.53)],
  //     R: randomRange(80, 100),
  //     midPoint: [0, 0],
  //     maxIterations: initialIterationNumber,
  //     screenSize: canvasSize,
  //     scale: 0.01,
  //   }),

  //   maxIterations: initialIterationNumber,
  //   screenSize: canvasSize,
  //   colorConverter: createIterationsColorConverterFn(
  //     [
  //       [
  //         randomRangeInt(0, 255),
  //         randomRangeInt(0, 255),
  //         randomRangeInt(0, 255),
  //         255,
  //       ],
  //       [
  //         randomRangeInt(0, 255),
  //         randomRangeInt(0, 255),
  //         randomRangeInt(0, 255),
  //         255,
  //       ],
  //     ],
  //     [
  //       randomRangeInt(0, 255),
  //       randomRangeInt(0, 255),
  //       randomRangeInt(0, 255),
  //       255,
  //     ]
  //   ),
  // });

  const colorStart = [Math.random(), Math.random(), Math.random()];
  const colorEnd = [Math.random(), Math.random(), Math.random()];
  const colorOverflow = [Math.random(), Math.random(), Math.random()];

  console.log("colorStart", colorStart);
  console.log("colorEnd", colorEnd);
  console.log("colorOverflow", colorOverflow);

  // const fractalC = [-0.55, -0.595];
  // const fractalR = 2;

  // const fractalC = [-0.5, -0.595];
  const fractalC = [-0.54, -0.55];

  const fractalR = 3;
  const rangeSize = randomRange(0.2, 0.6);
  const fractalRRangeStart = [-rangeSize, -rangeSize];
  const fractalRRangeEnd = [rangeSize, rangeSize];

  const uniqnessMod = (Math.random() - 0.5) * 300;

  const uniqnessMod1 = (Math.random() - 0.5) * 300;

  const uniqnessMod2 = (Math.random() - 0.5) * 300;
  const startSep = randomRange(1.5, 3);
  const loop = createRenderLoop({
    loopIterationCallback: async ({ timeSinceStart }) => {
      const originalTimeSinceStart = timeSinceStart;
      timeSinceStart = timeSinceStart / 50;
      // console.log('timeSinceStart', timeSinceStart, timeDelta, 1000/timeDelta);
      // const iterationFractalC = [fractalC[0], fractalC[1] ]

      const iterationFractalC = [
        fractalC[0] + Math.cos(timeSinceStart / (1131 + uniqnessMod)) * 0.03,
        fractalC[1] + Math.sin(timeSinceStart / (1000 + uniqnessMod1)) * 0.03,
      ];
      const iterationFractalR = fractalR;

      const iterationFractalRRangeStart = [
        fractalRRangeStart[0] +
          Math.cos(timeSinceStart / (1131 + uniqnessMod2)) * 0.02,
        fractalRRangeStart[1] +
          Math.sin(timeSinceStart / (1030 + uniqnessMod)) * 0.02,
      ];
      const iterationFractalRRangeEnd = [
        fractalRRangeEnd[0] +
          Math.cos(timeSinceStart / (1000 + uniqnessMod1)) * 0.02,
        fractalRRangeEnd[1] +
          Math.sin(timeSinceStart / (1412 + uniqnessMod2)) * 0.02,
      ];

      context.viewport(0, 0, ...canvasSize);
      context.clearColor(1, 1, 1, 1);
      context.clear(context.COLOR_BUFFER_BIT);
      context.useProgram(shaderProgram);
      context.enableVertexAttribArray(positionAttributeLocation);
      context.uniform2f(
        resolutionUniformLocation,
        context.canvas.width,
        context.canvas.height
      );

      context.bindBuffer(context.ARRAY_BUFFER, positionBuffer);

      const size = 2; // 2 components per iteration
      const type = context.FLOAT; // the data is 32bit floats
      const normalize = false; // don't normalize the data
      const stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
      const offset = 0; // start at the beginning of the buffer
      context.vertexAttribPointer(
        positionAttributeLocation,
        size,
        type,
        normalize,
        stride,
        offset
      );

      context.uniform3f(
        colorStartUniformLocation,
        colorStart[0],
        colorStart[1],
        colorStart[2]
      );
      context.uniform3f(
        colorEndUniformLocation,
        colorEnd[0],
        colorEnd[1],
        colorEnd[2]
      );
      context.uniform3f(
        colorOverflowUniformLocation,
        colorOverflow[0],
        colorOverflow[1],
        colorOverflow[2]
      );

      context.uniform1f(
        fractalSepLocation,
        startSep +
          Math.sin(timeSinceStart / (10000 + uniqnessMod)) * (startSep - 1.0)
      );
      context.uniform1f(fractalTimeLocation, originalTimeSinceStart);

      context.uniform1f(fractalRLocation, iterationFractalR);
      context.uniform2f(
        fractalCLocation,
        iterationFractalC[0],
        iterationFractalC[1]
      );

      context.uniform2f(
        fractalRRangeStartLocation,
        iterationFractalRRangeStart[0],
        iterationFractalRRangeStart[1]
      );
      context.uniform2f(
        fractalRRangeEndLocation,
        iterationFractalRRangeEnd[0],
        iterationFractalRRangeEnd[1]
      );

      const primitiveType = context.TRIANGLES;
      const offset2 = 0;
      const count2 = 6;
      context.drawArrays(primitiveType, offset2, count2);
    },
  });

  return loop;
};

// const renderLoop = (context: CanvasRenderingContext2D) => {
//   let timeS = 0;

//   const R = 2;

//   let lastOverflowColor: RGBAVector = [
//     randomRangeInt(0, 255),
//     randomRangeInt(0, 255),
//     randomRangeInt(0, 255),
//     255,
//   ];

//   const renderer0 = new JuliaSetRenderer({
//     juliaSet: new JuliaSet({
//       c: [randomRange(-0.712, -0.5), randomRange(-0.712, -0.5)],
//       R: randomRange(80, 100),
//       midPoint: [0, 0],
//       maxIterations: initialIterationNumber,
//       screenSize: [width, height],
//       scale: 1,
//     }),
//     maxIterations: initialIterationNumber,
//     screenSize: [width, height],
//     colorConverter: createIterationsColorConverterFn(
//       [
//         [
//           randomRangeInt(0, 255),
//           randomRangeInt(0, 255),
//           randomRangeInt(0, 255),
//           255,
//         ],
//         [
//           randomRangeInt(0, 255),
//           randomRangeInt(0, 255),
//           randomRangeInt(0, 255),
//           255,
//         ],
//       ],
//       lastOverflowColor
//     ),
//   });

//   const renderers = [renderer0];
//   const rendererContexts: RendererContext[] = [
//     {
//       maxCoords: undefined,
//     },
//   ];

//   let lastRender = Date.now();

//   const numOfPixels = width * height;
//   const rawRender = () => {
//     render(context, renderers);

//     const currentTime = Date.now();
//     const timeDelta = currentTime - lastRender;
//     lastRender = currentTime;
//     const deltaSeconds = timeDelta / 1000;
//     timeS += deltaSeconds;

//     renderers.forEach((renderer, i) => {
//       const { maxCoords } = rendererContexts[i];

//       if (!maxCoords) {
//         rendererContexts[i].maxCoords = renderer.maxIntensityPoints[0];
//       } else {
//         let minDPoint = renderer.maxIntensityPoints[0];
//         let minD = distance(maxCoords, minDPoint);

//         renderer.maxIntensityPoints.forEach((p) => {
//           const newD = distance(maxCoords, p);
//           if (newD < minD) {
//             minD = newD;
//             minDPoint = p;
//           }
//         });
//         rendererContexts[i].maxCoords = minDPoint;
//       }
//       const zoom = rendererContexts[i].maxCoords;

//       const targetRXMidPoint = convertScreenCoordToSpace(
//         zoom?.[0] || 0,
//         renderer.screenSize[0],
//         renderer.juliaSet.midPoint[0],
//         renderer.juliaSet.R,
//         renderer.juliaSet.scale
//       );
//       const targetRYMidPoint = convertScreenCoordToSpace(
//         zoom?.[1] || 0,
//         renderer.screenSize[1],
//         renderer.juliaSet.midPoint[1],
//         renderer.juliaSet.R,
//         renderer.juliaSet.scale
//       );

//       const speed = i === 0 ? 0.5 : 0.35;
//       renderer.juliaSet.midPoint[0] -=
//         (renderer.juliaSet.midPoint[0] - targetRXMidPoint) *
//         deltaSeconds *
//         speed;
//       renderer.juliaSet.midPoint[1] -=
//         (renderer.juliaSet.midPoint[1] - targetRYMidPoint) *
//         deltaSeconds *
//         speed;

//       renderer.juliaSet.scale -=
//         renderer.juliaSet.scale * (speed * deltaSeconds);

//       if (
//         i === renderers.length - 1 &&
//         renderer.numberOfOverflows / numOfPixels > 0.2
//       ) {
//         const prevOverflowColor = lastOverflowColor;
//         lastOverflowColor = [
//           randomRangeInt(0, 255),
//           randomRangeInt(0, 255),
//           randomRangeInt(0, 255),
//           255,
//         ];
//         renderers.push(
//           new JuliaSetRenderer({
//             juliaSet: new JuliaSet({
//               c: [randomRange(-0.712, -0.5), randomRange(-0.712, -0.5)],
//               R: randomRange(80, 100),
//               midPoint: [0, 0],
//               maxIterations: initialIterationNumber,
//               screenSize: [width, height],
//               scale: 1,
//             }),
//             maxIterations: initialIterationNumber,
//             screenSize: [width, height],
//             colorConverter: createIterationsColorConverterFn(
//               [
//                 prevOverflowColor,
//                 [
//                   randomRangeInt(0, 255),
//                   randomRangeInt(0, 255),
//                   randomRangeInt(0, 255),
//                   255,
//                 ],
//               ],
//               lastOverflowColor
//             ),
//           })
//         );
//         rendererContexts.push({
//           maxCoords: undefined,
//         });
//       }

//       if (i === 0 && renderer.renderedNumber < 10) {
//         renderers.shift();
//         rendererContexts.shift();
//       }
//     });

//     requestAnimationFrame(rawRender);
//   };

//   requestAnimationFrame(rawRender);
// };

// const render = async (
//   context: CanvasRenderingContext2D,
//   renderers: JuliaSetRenderer[]
// ) => {
//   const pairs = splitToPairs(renderers[0].screenSize[0], workers.length);
//   const width = renderers[0].screenSize[0];
//   const height = renderers[0].screenSize[1];

//   const intensities = await Promise.all(
//     pairs.map((pair) =>
//       workers.request({
//         type: "calculate_fractal_points",
//         request: {
//           xStart: pair[0],
//           xEnd: pair[1],
//           juliaSetParams: {
//             c: renderers[0].juliaSet.c,
//             maxIterations: renderers[0].juliaSet.maxIterations,
//             midPoint: renderers[0].juliaSet.midPoint,
//             R: renderers[0].juliaSet.R,
//             scale: renderers[0].juliaSet.scale,
//             screenSize: renderers[0].juliaSet.screenSize,
//           },
//         },
//       })
//     )
//   );

//   var canvasData = new ImageData(width, height);

//   renderers[0].clearIntensity();

//   pairs.forEach((pair, index) => {
//     const data = intensities[index].response.iterations;

//     for (let x = pair[0], xi = 0; x < pair[1]; x++, xi++) {
//       for (let y = 0; y < height; y++) {
//         let { color, overflowed } = { color: [0, 0, 0, 0], overflowed: true };

//         color = renderers[0].colorConverter(data[xi][y], renderers[0].maxIterations, [x, y]);

//         const index = (x + y * width) * 4;

//         canvasData.data[index] = color[0];
//         canvasData.data[index + 1] = color[1];
//         canvasData.data[index + 2] = color[2];
//         canvasData.data[index + 3] = color[3];
//       }
//     }
//   });

//   // for (let x = 0; x <= width; x++) {
//   //   for (let y = 0; y <= height; y++) {
//   //     let { color, overflowed } = { color: [0, 0, 0, 0], overflowed: true };

//   //     renderers.some((renderer) => {
//   //       ({ color, overflowed } = renderer.getPixelColor([x, y]));
//   //       return !overflowed;
//   //     });

//   //     const index = (x + y * width) * 4;

//   //     canvasData.data[index] = color[0];
//   //     canvasData.data[index + 1] = color[1];
//   //     canvasData.data[index + 2] = color[2];
//   //     canvasData.data[index + 3] = color[3];
//   //   }
//   // }

//   context.putImageData(canvasData, 0, 0);
// };

// const render2 = async (
//   context: CanvasRenderingContext2D,
//   renderers: JuliaSetRenderer[]
// ) => {

//   var canvasData = context.getImageData(0, 0, width, height);
//   renderers[0].clearIntensity();

//   for (let x = 0; x <= width; x++) {
//     for (let y = 0; y <= height; y++) {
//       let { color, overflowed } = { color: [0, 0, 0, 0], overflowed: true };

//       renderers.some((renderer) => {
//         ({ color, overflowed } = renderer.getPixelColor([x, y]));
//         return !overflowed;
//       });

//       const index = (x + y * width) * 4;

//       canvasData.data[index] = color[0];
//       canvasData.data[index + 1] = color[1];
//       canvasData.data[index + 2] = color[2];
//       canvasData.data[index + 3] = color[3];
//     }
//   }

//   context.putImageData(canvasData, 0, 0);
// };

// const splitToPairs = (
//   numberToSplit: number,
//   numberOfSplits: number
// ): [number, number][] => {
//   let chunkSize = numberToSplit / numberOfSplits;

//   if (chunkSize < 1) {
//     return [];
//   }

//   chunkSize = Math.floor(chunkSize);

//   const splits: [number, number][] = [];

//   for (let i = 0; i < numberOfSplits; i++) {
//     splits.push([i * chunkSize, (i + 1) * chunkSize]);
//   }

//   splits[numberOfSplits - 1][1] += numberToSplit % numberOfSplits;

//   return splits;
// };

function createShader(
  gl: WebGLRenderingContext,
  type:
    | WebGLRenderingContext["VERTEX_SHADER"]
    | WebGLRenderingContext["FRAGMENT_SHADER"],
  source: string
) {
  const shader = gl.createShader(type);

  if (!shader) {
    return;
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }

  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

function createProgram(
  gl: WebGLRenderingContext,
  vertexShader: WebGLShader | undefined,
  fragmentShader: WebGLShader | undefined
) {
  const program = gl.createProgram();

  if (!program) {
    return;
  }
  if (vertexShader) {
    gl.attachShader(program, vertexShader);
  }
  if (fragmentShader) {
    gl.attachShader(program, fragmentShader);
  }

  gl.linkProgram(program);
  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }

  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}
