import type { Scenario } from "../types/scenario";

interface ScenarioPanelProps {
  scenarios: Scenario[];
  selectedScenarioId: string | null;
  isLoading: boolean;
  errorMessage: string | null;
  onCreate: () => void;
  onSelect: (scenarioId: string) => void;
  onDelete: (scenario: Scenario) => void;
}

function readableStatus(status: Scenario["status"]): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export function ScenarioPanel({
  scenarios,
  selectedScenarioId,
  isLoading,
  errorMessage,
  onCreate,
  onSelect,
  onDelete,
}: ScenarioPanelProps) {
  return (
    <section className="panel scenario-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Your training workspace</p>
          <h2>Scenarios</h2>
        </div>

        <button className="primary-button compact-button" onClick={onCreate} type="button">
          + Create
        </button>
      </div>

      {isLoading && <p className="empty-state">Loading your scenarios…</p>}

      {!isLoading && errorMessage && (
        <p className="auth-error panel-message">{errorMessage}</p>
      )}

      {!isLoading && !errorMessage && scenarios.length === 0 && (
        <div className="empty-state">
          <p>No scenarios yet.</p>
          <p>Create one to begin a fictional training session.</p>
        </div>
      )}

      {!isLoading && !errorMessage && scenarios.length > 0 && (
        <div className="scenario-list">
          {scenarios.map((scenario) => (
            <article
              className={`scenario-card ${
                scenario.id === selectedScenarioId ? "selected" : ""
              }`}
              key={scenario.id}
            >
              <button
                className="scenario-select-button"
                onClick={() => onSelect(scenario.id)}
                type="button"
              >
                <span className="scenario-card-header">
                  <strong>{scenario.name}</strong>
                  <span className={`scenario-status ${scenario.status.toLowerCase()}`}>
                    {readableStatus(scenario.status)}
                  </span>
                </span>

                {scenario.description && (
                  <span className="scenario-description">
                    {scenario.description}
                  </span>
                )}
              </button>

              <button
                aria-label={`Delete ${scenario.name}`}
                className="scenario-delete-button"
                onClick={() => onDelete(scenario)}
                type="button"
              >
                Delete
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}