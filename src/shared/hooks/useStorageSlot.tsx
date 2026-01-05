import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

const DEBOUNCE_MS = 300;

function readStorage<T>(key: string, parse: (raw: string) => T): T | undefined {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? parse(raw) : undefined;
  } catch {
    return undefined;
  }
}

function writeStorage<T>(key: string, value: T, stringify: (v: T) => string) {
  try {
    localStorage.setItem(key, stringify(value));
  } catch {
    // Storage full or unavailable
  }
}

export function createStorageSlot<T>(options?: {
  parse?: (raw: string) => T;
  stringify?: (value: T) => string;
  debounceMs?: number;
}) {
  const {
    parse = JSON.parse as (raw: string) => T,
    stringify = JSON.stringify as (value: T) => string,
    debounceMs = DEBOUNCE_MS,
  } = options ?? {};

  type ContextValue = {
    value: T;
    setValue: Dispatch<SetStateAction<T>>;
  };

  const SlotContext = createContext<ContextValue | null>(null);

  const SlotProvider = ({
    storageKey,
    initialValue,
    children,
  }: {
    storageKey: string;
    initialValue: T;
    children: ReactNode;
  }) => {
    const keyRef = useRef(storageKey);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [state, setState] = useState<T>(() => {
      return readStorage(storageKey, parse) ?? initialValue;
    });

    const stateRef = useRef(state);
    stateRef.current = state;

    useEffect(() => {
      const prevKey = keyRef.current;

      if (prevKey !== storageKey) {
        localStorage.removeItem(prevKey);

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }

        const stored = readStorage(storageKey, parse);
        if (stored !== undefined) {
          setState(stored);
        } else {
          writeStorage(storageKey, stateRef.current, stringify);
        }

        keyRef.current = storageKey;
      }
    }, [storageKey]);

    useEffect(() => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        writeStorage(keyRef.current, state, stringify);
        timeoutRef.current = null;
      }, debounceMs);

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      };
    }, [state]);

    useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          writeStorage(keyRef.current, stateRef.current, stringify);
          clearTimeout(timeoutRef.current);
        }
      };
    }, []);

    const ctx = useMemo(() => ({ value: state, setValue: setState }), [state]);

    return <SlotContext.Provider value={ctx}>{children}</SlotContext.Provider>;
  };

  const useSlot = (): [T, Dispatch<SetStateAction<T>>] => {
    const ctx = useContext(SlotContext);

    if (!ctx) {
      throw new Error(
        "useSlot must be used within its corresponding SlotProvider",
      );
    }
    return [ctx.value, ctx.setValue];
  };

  return { SlotProvider, useSlot };
}
