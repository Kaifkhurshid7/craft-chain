"use client";

import React, { ReactNode, ReactElement } from "react";
import { Alert } from "./Alert";
import { logError } from "@/lib/errorLogger";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactElement;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Error Boundary component for catching React rendering errors
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console
    console.error("Error caught by boundary:", error, errorInfo);

    // Log to error logger
    logError("React component error", error, {
      componentStack: errorInfo.componentStack,
    });

    // Update state with error details
    this.setState({
      error,
      errorInfo,
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <Alert
              type="error"
              title="Something Went Wrong"
              message="An unexpected error occurred. The application encountered a problem and couldn't recover from it."
              dismissible={false}
            />

            {process.env.NODE_ENV === "development" && error && (
              <div className="mt-6 bg-white rounded-lg shadow-lg p-6 border-2 border-red-200">
                <h3 className="text-lg font-bold text-red-800 mb-2">Error Details (Development)</h3>
                <p className="text-sm font-mono text-gray-700 bg-gray-100 p-3 rounded mb-4 overflow-auto max-h-32">
                  {error.toString()}
                </p>

                {errorInfo && (
                  <div>
                    <h4 className="text-sm font-bold text-gray-700 mb-2">Component Stack</h4>
                    <p className="text-xs font-mono text-gray-600 bg-gray-100 p-3 rounded overflow-auto max-h-32">
                      {errorInfo.componentStack}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-blue-600 transition"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.href = "/"}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return children;
  }
}

/**
 * Functional wrapper for ErrorBoundary
 */
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorHandler?: (error: Error, errorInfo: React.ErrorInfo) => void
) => {
  const Wrapped = (props: P) => (
    <ErrorBoundary onError={errorHandler}>
      <Component {...props} />
    </ErrorBoundary>
  );

  Wrapped.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return Wrapped;
};
