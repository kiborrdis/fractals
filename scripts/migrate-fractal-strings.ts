import * as fs from "node:fs";
import * as path from "node:path";
import * as zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const FRACTAL_STRINGS_PATH = path.resolve(
  __dirname,
  "../src/app/fractalStrings.ts",
);

const staticNumberRule = (value: number) => ({ t: 0, value });

function migrate(data: unknown): unknown {
  if (typeof data !== "object" || data === null) return data;

  const obj = data as Record<string, unknown>;
  const result: Record<string, unknown> = { ...obj };

  const oldTrapIntensity =
    typeof result.trapIntensity === "number" ? result.trapIntensity : undefined;
  const oldTrapDistancepow =
    typeof result.trapDistancepow === "number"
      ? result.trapDistancepow
      : undefined;
  const oldBorderIntensity =
    typeof result.borderIntensity === "number"
      ? result.borderIntensity
      : undefined;

  delete result.trapIntensity;
  delete result.trapDistancepow;
  delete result.borderIntensity;

  const dynamic =
    typeof result.dynamic === "object" && result.dynamic !== null
      ? { ...(result.dynamic as Record<string, unknown>) }
      : {};

  if (!("trapDistMult" in dynamic)) {
    dynamic.trapDistMult = staticNumberRule(oldTrapIntensity ?? 0);
  }

  if (!("trapDistPow" in dynamic)) {
    dynamic.trapDistPow = staticNumberRule(oldTrapDistancepow ?? 0.5);
  }

  if (!("borderDistMult" in dynamic)) {
    dynamic.borderDistMult = staticNumberRule(oldBorderIntensity ?? 10);
  }

  if (!("borderDistPow" in dynamic)) {
    dynamic.borderDistPow = staticNumberRule(0.5);
  }

  result.dynamic = dynamic;

  const migrateGradientStop = (stop: unknown): unknown => {
    if (!Array.isArray(stop)) return stop;
    // Old format: [pos, r, g, b, a] — 5 numbers
    if (stop.length === 5 && stop.every((v) => typeof v === "number")) {
      return [stop[0], [stop[1], stop[2], stop[3], stop[4]]];
    }
    return stop;
  };

  const migrateGradient = (gradient: unknown): unknown => {
    if (!Array.isArray(gradient)) return gradient;
    return gradient.map(migrateGradientStop);
  };

  if ("gradient" in result) {
    result.gradient = migrateGradient(result.gradient);
  }

  if ("trapGradient" in result) {
    result.trapGradient = migrateGradient(result.trapGradient);
  }

  return result;
}

// ── Serialization ──────────────────────────────────────────────────────────────
// Mirrors the browser-side serialization in src/features/fractals/serialization.ts
// using Node.js zlib (deflate = RFC 1950, matching CompressionStream("deflate")).

function deserialize(str: string): unknown {
  const buffer = Buffer.from(str, "base64");
  const json = zlib.inflateSync(buffer).toString("utf-8");
  return JSON.parse(json);
}

function serialize(data: unknown): string {
  const json = JSON.stringify(data);
  const compressed = zlib.deflateSync(Buffer.from(json, "utf-8"));
  return compressed.toString("base64");
}


function extractStrings(src: string): string[] {
  return [...src.matchAll(/"([A-Za-z0-9+/=]+)"/g)].map((m) => m[1]);
}

function buildFileContent(strings: string[]): string {
  const items = strings.map((s) => `  "${s}",`).join("\n");
  return `export const fractals: string[] = [\n${items}\n];\n`;
}

const src = fs.readFileSync(FRACTAL_STRINGS_PATH, "utf-8");
const original = extractStrings(src);

const migrated = original.map((s) => serialize(migrate(deserialize(s))));

fs.writeFileSync(FRACTAL_STRINGS_PATH, buildFileContent(migrated), "utf-8");

console.log(
  `✓ Migrated ${migrated.length} fractal string(s) → ${FRACTAL_STRINGS_PATH}`,
);
