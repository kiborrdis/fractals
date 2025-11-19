import { JuliaSet } from "./features/fractals/JuliaSetRenderer";
import {
  CalculateFractalPointsRequest,
  CalculateFractalPointsResponse,
  WorkerRequest,
} from "./messages/types";

onmessage = (e) => {
  const request = e.data as WorkerRequest;

  if (request.type === "calculate_fractal_points") {
    const result = calculateFractalPoints(request.request);

    postMessage({
      type: "calculate_fractal_points",
      id: request.id,
      response: {
        iterations: result,
      },
    } as CalculateFractalPointsResponse);
  }
};

const calculateFractalPoints = ({
  xStart,
  xEnd,
  juliaSetParams,
}: CalculateFractalPointsRequest["request"]) => {
  const juliaSet = new JuliaSet(juliaSetParams);
  const result: number[][] = new Array(xEnd - xStart).fill(0).map(() => []);

  let max = 0;
  // let coords: Vector2 = [0, 0];
  for (let x = xStart, xi = 0; x < xEnd; x++, xi++) {
    for (let y = 0; y < juliaSetParams.screenSize[1]; y++) {
      result[xi][y] = juliaSet.iteratePoint([x, y]);

      if (max < result[xi][y]) {
        max = result[xi][y];
        // coords = [xi, y];
      }
    }
  }

  return result;
};
