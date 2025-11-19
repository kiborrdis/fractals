import { Vector2 } from "../../../features/fractals/types";

export function sum(a: number, b: number): number;
export function sum(a: Vector2, b: Vector2): Vector2;
export function sum(a: Vector2, b: number): Vector2;
export function sum(a: number, b: Vector2): Vector2;
export function sum(a: number | Vector2, b: number | Vector2): number | Vector2 {
  if (typeof a === "number" && typeof b === "number") {
    return a + b;
  } else if (Array.isArray(a) && Array.isArray(b)) {
    return [a[0] + b[0], a[1] + b[1]];
  } else if (Array.isArray(a) && typeof b === "number") {
    return [a[0] + b, a[1] + b];
  } else if (typeof a === "number" && Array.isArray(b)) {
    return [a + b[0], a + b[1]];
  }

  return 0;
}

export function mul(a: number, b: number): number;
export function mul(a: Vector2, b: Vector2): Vector2;
export function mul(a: Vector2, b: number): Vector2;
export function mul(a: number, b: Vector2): Vector2;
export function mul(a: number | Vector2, b: number | Vector2): number | Vector2 {
  if (typeof a === "number" && typeof b === "number") {
    return a * b;
  } else if (Array.isArray(a) && Array.isArray(b)) {
    return [a[0] * b[0], a[1] * b[1]];
  } else if (Array.isArray(a) && typeof b === "number") {
    return [a[0] * b, a[1] * b];
  } else if (typeof a === "number" && Array.isArray(b)) {
    return [a * b[0], a * b[1]];
  }

  return 0;
}

export function divide(a: number, b: number): number;
export function divide(a: Vector2, b: Vector2): Vector2;
export function divide(a: Vector2, b: number): Vector2;
export function divide(a: number, b: Vector2): Vector2;
export function divide(a: number | Vector2, b: number | Vector2): number | Vector2 {
  if (typeof a === "number" && typeof b === "number") {
    return a / b;
  } else if (Array.isArray(a) && Array.isArray(b)) {
    return [a[0] / b[0], a[1] / b[1]];
  } else if (Array.isArray(a) && typeof b === "number") {
    return [a[0] / b, a[1] / b];
  } else if (typeof a === "number" && Array.isArray(b)) {
    return [a / b[0], a / b[1]];
  }

  return 0;
}