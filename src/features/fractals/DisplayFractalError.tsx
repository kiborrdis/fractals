import { ErrorBoundary } from "@/shared/ui/ErrorBoundary/ErrorBoundary";
import styles from "./DisplayFractalError.module.css";
import { FractalError, WebGLError, FractalFormulaError } from "./errors";

const getErrorType = (error: unknown): string => {
  if (error instanceof FractalFormulaError) {
    return "Fractal Formula Error";
  }
  if (error instanceof WebGLError) {
    return "WebGL Error";
  }
  if (error instanceof FractalError) {
    return "Fractal Error";
  }
  if (error instanceof Error) {
    return "Unknown Error";
  }
  return "Unknown Error";
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
};

export const DisplayFractalError = ({ error }: { error: unknown }) => {
  const errorType = getErrorType(error);
  const errorMessage = getErrorMessage(error);

  return (
    <div className={styles.container}>
      <div className={styles.errorBox}>
        <div className={styles.errorType}>{errorType}</div>
        <div className={styles.errorMessage}>{errorMessage}</div>
      </div>
    </div>
  );
};

export const withFractalErrorBoundary = <P extends object>(
  name: string,
  Component: React.ComponentType<P>,
) => {
  const Comp = (props: P) => {
    const Comp = (
      <ErrorBoundary errorComponent={DisplayFractalError}>
        <Component {...props} />
      </ErrorBoundary>
    );

    return Comp;
  };
  Comp.displayName = `withFractalErrorBoundary(${name})`;

  return Comp;
};
