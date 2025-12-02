/* eslint-disable @typescript-eslint/no-explicit-any */
export const throttle = <P extends any[]>(func: (...args: P) => void, delay: number): (...args: P) => void  => {
  let lastCall = 0;
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let args: P;

  return function (...newArgs: P) {
    const now = Date.now();
    const remaining = delay - (now - lastCall);
    args = newArgs;

    if (remaining <= 0) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      lastCall = now;
      return func(...args);
    } else if (!timeout) {
      timeout = setTimeout(() => {
        lastCall = Date.now();
        timeout = null;
        func(...args);
      }, remaining);
    }
  };
}