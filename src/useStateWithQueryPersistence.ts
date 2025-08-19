/* eslint-disable @typescript-eslint/no-explicit-any */
import { SetStateAction, useEffect, useState } from "react";

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
      const params = new URLSearchParams(window.location.search);
      params.set(key, stringify(state));
      window.history.replaceState({}, "", `?${params.toString()}`);
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, [key, state, stringify]);

  return [state, setState];
};
