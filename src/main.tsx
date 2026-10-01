import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./styles.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error('Could not find the element with id "root".');
}

const root = createRoot(rootElement);

function ImportError({ error }: { error: unknown }) {
  const message =
    error instanceof Error ? `${error.name}: ${error.message}` : String(error);

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "32px",
        boxSizing: "border-box",
        color: "#fff3f4",
        background: "#260d15",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1>asterCAD could not load App.tsx</h1>
      <p>
        The failure happened while importing App, before React could render its
        error boundary.
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
        {message}
      </pre>
    </main>
  );
}

void import("./App")
  .then(({ default: App }) => {
    root.render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>,
    );
  })
  .catch((error: unknown) => {
    root.render(<ImportError error={error} />);
  });