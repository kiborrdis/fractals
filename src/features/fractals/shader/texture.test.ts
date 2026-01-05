import { describe, expect, it } from "vitest";
import { encodeFloatTo4Bytes } from "./texture";

// Mirrors the GLSL decodeFloat function.
// Uses an offset of 2^31 to support negative values.
// Supported range: ±2147.483648
const FLOAT_ENCODE_OFFSET = 2147483648;

function decodeFloat(encoded: [number, number, number, number]): number {
  const [b1, b2, b3, b4] = encoded;
  return (
    (b1 * 16777216 + b2 * 65536 + b3 * 256 + b4 - FLOAT_ENCODE_OFFSET) / 1000000
  );
}

describe("encodeFloatTo4Bytes / decodeFloat roundtrip", () => {
  it("should roundtrip 1.0", () => {
    const encoded = encodeFloatTo4Bytes(1.0);
    expect(decodeFloat(encoded)).toBeCloseTo(1.0, 6);
  });

  it("should roundtrip 0.0", () => {
    const encoded = encodeFloatTo4Bytes(0.0);
    expect(decodeFloat(encoded)).toBe(0.0);
  });

  it("should roundtrip 0.5", () => {
    const encoded = encodeFloatTo4Bytes(0.5);
    expect(decodeFloat(encoded)).toBeCloseTo(0.5, 6);
  });

  it("should roundtrip small values like 0.001", () => {
    const encoded = encodeFloatTo4Bytes(0.001);
    expect(decodeFloat(encoded)).toBeCloseTo(0.001, 6);
  });

  it("should roundtrip 2.0", () => {
    const encoded = encodeFloatTo4Bytes(2.0);
    expect(decodeFloat(encoded)).toBeCloseTo(2.0, 6);
  });

  it("should roundtrip negative values like -1.5", () => {
    const encoded = encodeFloatTo4Bytes(-1.5);
    expect(decodeFloat(encoded)).toBeCloseTo(-1.5, 6);
  });

  it("should roundtrip negative values like -0.5", () => {
    const encoded = encodeFloatTo4Bytes(-0.5);
    expect(decodeFloat(encoded)).toBeCloseTo(-0.5, 6);
  });

  it("should roundtrip fractional values like 0.123456", () => {
    const encoded = encodeFloatTo4Bytes(0.123456);
    expect(decodeFloat(encoded)).toBeCloseTo(0.123456, 6);
  });

  it("should roundtrip PI", () => {
    const encoded = encodeFloatTo4Bytes(Math.PI);
    // precision limited to 6 decimal places (1/1000000)
    expect(decodeFloat(encoded)).toBeCloseTo(Math.PI, 5);
  });

  it("should produce bytes in 0-255 range", () => {
    const encoded = encodeFloatTo4Bytes(1.0);
    for (const byte of encoded) {
      expect(byte).toBeGreaterThanOrEqual(0);
      expect(byte).toBeLessThanOrEqual(255);
    }
  });

  it("should roundtrip many values", () => {
    const testValues = [
      -4.0, -3.0, -2.0, -1.5, -1.0, -0.5, 0, 0.1, 0.25, 0.333, 0.5, 0.75, 1.0,
      1.5, 2.0, 3.0, 4.0,
    ];
    for (const val of testValues) {
      const encoded = encodeFloatTo4Bytes(val);
      const decoded = decodeFloat(encoded);
      expect(decoded).toBeCloseTo(val, 5);
    }
  });
});
