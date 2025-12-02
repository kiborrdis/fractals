import { describe, expect, vitest, it } from "vitest";
import { throttle } from "./throttle";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe("throttle", () => {
  it("should throttle sequential func calls", async () => {
    const spy = vitest.fn();
    const throttledFn = throttle(spy, 10);

    throttledFn();
    throttledFn();
    throttledFn();

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("should throttle func calls after delay", async () => {
    const spy = vitest.fn();
    const throttledFn = throttle(spy, 10);

    throttledFn();

    await delay(2);
    throttledFn();

    await delay(2);
    throttledFn();

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("should make call after throttle delay if there was throttled calls", async () => {
    const spy = vitest.fn();
    const throttledFn = throttle(spy, 10);

    throttledFn();
    throttledFn();
    throttledFn();

    await delay(12);

    expect(spy).toHaveBeenCalledTimes(2);
  });

    it("should not make call after throttle delay if there was no throttled calls", async () => {
    const spy = vitest.fn();
    const throttledFn = throttle(spy, 10);

    throttledFn();

    await delay(12);

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("should make call right away after throttle delay", async () => {
    const spy = vitest.fn();
    const throttledFn = throttle(spy, 10);

    throttledFn();

    await delay(12);
    expect(spy).toHaveBeenCalledTimes(1);
    
    throttledFn();
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it("should use last passed argument in throttled call", async () => {
    const spy = vitest.fn();
    const throttledFn = throttle(spy, 10);

    throttledFn(1);
    throttledFn(2);
    throttledFn(3);

    await delay(12);

    expect(spy).toHaveBeenLastCalledWith(3);
  });
});
