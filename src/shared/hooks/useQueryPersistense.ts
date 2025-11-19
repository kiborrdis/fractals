/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

export const defaultStringify = (value: any) => {
  const jsonString = JSON.stringify(value);
  const base64String = btoa(jsonString);
  return base64String;
};

const defaultParse = (value: any) => {
  const jsonString = atob(value);
  return JSON.parse(jsonString);
};

export const useStateWithQueryPersistence = <T>(
  key: string,
  initialValue: T,
  options?: {
    parse?: (value: string) => T;
    stringify?: (value: T) => string;
  }
): [T, React.Dispatch<SetStateAction<T>>] => {
  const { parse = defaultParse, stringify = defaultStringify } = options || {};

  const [state, setState] = useState<T>(() => {
    const queryValue = new URLSearchParams(window.location.search).get(key);
    return queryValue ? parse(queryValue) : initialValue;
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      console.log("save");
      const params = new URLSearchParams(window.location.search);
      params.set(key, stringify(state));
      window.history.replaceState({}, "", `?${params.toString()}`);
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, [key, state, stringify]);

  return [state, setState];
};

export const useQueryPersistentValue = <T>(
  key: string,
  initialValue: T,
  options?: {
    parse?: (value: string) => T;
    stringify?: (value: T) => string;
  }
): [T, (newValue: T) => void] => {
  const { parse = defaultParse, stringify = defaultStringify } = options || {};

  const valueRef = useRef<T | null>(null);
  const timeoutId = useRef<null | number>(null);

  if (valueRef.current === null) {
    const queryValue = new URLSearchParams(window.location.search).get(key);
    valueRef.current = queryValue ? parse(queryValue) : initialValue;
  }

  useEffect(() => () => {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }
  }, []);

  return [
    valueRef.current!,
    useCallback(
      (newValue: T) => {
        valueRef.current = newValue;

        if (timeoutId.current) {
          return;
        }

        timeoutId.current = setTimeout(() => {
          timeoutId.current = null;

          if (!valueRef.current) {
            return;
          }

          const params = new URLSearchParams(window.location.search);
          params.set(key, stringify(valueRef.current));
          window.history.replaceState({}, "", `?${params.toString()}`);
        }, 5000);
      },
      [key, stringify]
    ),
  ];
};
