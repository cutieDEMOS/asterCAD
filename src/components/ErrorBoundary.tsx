import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
  details: string | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    error: null,
    details: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      error,
      details: error.stack ?? null,
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.setState({
      details: `${error.stack ?? "No JavaScript stack available."}

Component stack:
${info.componentStack ?? "No React component stack available."}`,
    });
  }

  render() {
    if (this.state.error) {
      return (
        <main
          style={{
            minHeight: "100vh",
            padding: "32px",
            color: "#ffe9eb",
            background: "#260d15",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <h1>asterCAD crashed while rendering</h1>

          <p>
            Copy the error text below. Do not include any tokens, keys, or
            account details.
          </p>

          <pre
            style={{
              overflowX: "auto",
              border: "1px solid #8d4554",
              borderRadius: "8px",
              padding: "16px",
              color: "#fff3f4",
              background: "#3b111c",
              lineHeight: 1.45,
              whiteSpace: "pre-wrap",
            }}
          >
            {this.state.error.name}: {this.state.error.message}
            {"\n\n"}
            {this.state.details}
          </pre>
        </main>
      );
    }

    return this.props.children;
  }
}