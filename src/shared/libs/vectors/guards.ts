import { Vector2 } from "./types";

export const isVector2 = (value: unknown): value is Vector2 => {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    typeof value[0] === "number" &&
    typeof value[1] === "number"
  );
};
