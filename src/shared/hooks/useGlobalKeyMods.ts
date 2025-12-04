import { useEffect, useState } from "react";

let shiftPressed = false;
let ctrlPressed = false;

const downHandler = (event: KeyboardEvent) => {
  if (event.key === "Shift") {
    shiftPressed = true;
    fireCallbacks();
  } else if (event.key === "Control") {
    ctrlPressed = true;
    fireCallbacks();
  }
};

const upHandler = (event: KeyboardEvent) => {
  if (event.key === "Shift") {
    shiftPressed = false;
    fireCallbacks();
  } else if (event.key === "Control") {
    ctrlPressed = false;
    fireCallbacks();
  }
};

window.addEventListener("keydown", downHandler);
window.addEventListener("keyup", upHandler);

const changeCallback: Set<() => void> = new Set();
const fireCallbacks = () => {
  changeCallback.forEach((cb) => cb());
};

export const useGlobalKeyMods = () => {
  const [, setV] = useState(false);
  useEffect(() => {
    const cb = () => setV((v) => !v);
    changeCallback.add(cb);
    return () => {
      changeCallback.delete(cb);
    };
  }, []);

  return {
    shift: shiftPressed,
    ctrl: ctrlPressed,
  };
};
