import type { JuliaSetParams } from "../fractals/JuliaSetRenderer";

export type GenericWorkerRequest<T extends string, D> = {
    type: T,
    request: D,
    id: string,
};

export type CalculateFractalPointsRequest = GenericWorkerRequest<'calculate_fractal_points', {
    xStart: number,
    xEnd: number,
    juliaSetParams: JuliaSetParams,
}>;

export type WorkerRequest = CalculateFractalPointsRequest;


export type GenericWorkerResponse<T extends string, D> = {
    type: T,
    response: D,
    id: string
}

export type CalculateFractalPointsResponse = GenericWorkerResponse<'calculate_fractal_points', {
    iterations: number[][],
}>;

export type WorkerResponse = CalculateFractalPointsResponse;
