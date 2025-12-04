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

export const defaultParse = (value: any) => {
  const jsonString = atob(value);
  return JSON.parse(jsonString);
};

export const defaultExtract = (key: string) => {
  const params = new URLSearchParams(window.location.search);
  return params.get(key);
};

export const defaultSave = (key: string, value: string) => {
  const params = new URLSearchParams(window.location.search);
  params.set(key, value);
  window.history.replaceState({}, "", `?${params.toString()}`);
};

export const useStateWithQueryPersistence = <T>(
  key: string,
  initialValue: T,
  options?: {
    parse?: (value: string) => T;
    stringify?: (value: T) => string;
    extract?: (key: string) => string | null | undefined;
    save?: (key: string, value: string) => void;
  },
): [T, React.Dispatch<SetStateAction<T>>] => {
  const {
    parse = defaultParse,
    stringify = defaultStringify,
    extract = defaultExtract,
    save = defaultSave,
  } = options || {};

  const [state, setState] = useState<T>(() => {
    const queryValue = extract(key);
    return queryValue ? parse(queryValue) : initialValue;
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      save(key, stringify(state));
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, [key, state, stringify, save]);

  return [state, setState];
};

export const useQueryPersistentValue = <T>(
  key: string,
  initialValue: T,
  options?: {
    parse?: (value: string) => T;
    stringify?: (value: T) => string;
    extract?: (key: string) => string | null | undefined;
    save?: (key: string, value: string) => void;
  },
): [T, (newValue: T) => void] => {
  const {
    parse = defaultParse,
    stringify = defaultStringify,
    extract = defaultExtract,
    save = defaultSave,
  } = options || {};

  const valueRef = useRef<T | null>(null);
  const timeoutId = useRef<null | unknown>(null);

  if (valueRef.current === null) {
    const queryValue = extract(key);
    valueRef.current = queryValue ? parse(queryValue) : initialValue;
  }

  useEffect(
    () => () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current as any);
      }
    },
    [],
  );

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

          save(key, stringify(valueRef.current));
        }, 5000);
      },
      [key, stringify, save],
    ),
  ];
};
