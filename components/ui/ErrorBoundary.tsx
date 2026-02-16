"use client";

import { Component, type ReactNode, type ErrorInfo } from "react";
import { Button } from "./Button";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Log error in development only
    if (process.env.NODE_ENV === "development") {
      console.error("ErrorBoundary caught:", error, info);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[200px] p-8 text-center">
          <AlertTriangle size={48} className="text-[var(--warning)] mb-4" />
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
            Something went wrong
          </h2>
          <p className="text-[var(--text-secondary)] mb-4 max-w-md">
            An error occurred while rendering this section.
            Try refreshing or click below to retry.
          </p>
          <Button onClick={this.handleReset} variant="secondary">
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
