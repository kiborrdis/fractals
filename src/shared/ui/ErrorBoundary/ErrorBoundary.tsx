import React, { ComponentType, ReactNode } from "react";

const errorContext = React.createContext<{
  reportError: (error: unknown) => void;
}>({
  reportError: () => {},
});

type ErrorBoundaryProps = {
  children: ReactNode;
  errorComponent: ComponentType<{
    error: unknown | undefined;
    onReset: () => void;
  }>;
};

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  { error: unknown }
> {
  state = {
    error: undefined,
  };

  componentDidCatch(error: Error): void {
    this.setState({
      error,
    });
  }

  onReset = () => {
    this.setState({
      error: undefined,
    });
  };

  reportError = (error: unknown) => {
    this.setState({
      error,
    });
  };

  reportErrorObj: { reportError: (error: unknown) => void } = {
    reportError: this.reportError,
  };

  render() {
    if (this.state.error !== undefined) {
      const ErrorComponent = this.props.errorComponent;
      return <ErrorComponent error={this.state.error} onReset={this.onReset} />;
    }

    return (
      <errorContext.Provider value={this.reportErrorObj}>
        {this.props.children}
      </errorContext.Provider>
    );
  }
}

export const useErrorBoundary = () => {
  const { reportError } = React.useContext(errorContext);
  return reportError;
};
