import type { Scenario } from "../types/scenario";

interface ConsoleHeaderProps {
  scenarios: Scenario[];
  selectedScenarioId: string | null;
  onSelectScenario: (scenarioId: string) => void;
  onNewIncident: () => void;
}

export function ConsoleHeader({
  scenarios,
  selectedScenarioId,
  onSelectScenario,
  onNewIncident,
}: ConsoleHeaderProps) {
  const selectedScenario = scenarios.find(
    (scenario) => scenario.id === selectedScenarioId,
  );

  return (
    <header className="console-header">
      <div>
        <p className="breadcrumb">Dispatch / Operations Console</p>
        <h1>{selectedScenario?.name ?? "Local training demo"}</h1>
      </div>

      <div className="console-header-actions">
        <label className="scenario-select-label">
          <span>Scenario</span>
          <select
            disabled={scenarios.length === 0}
            onChange={(event) => onSelectScenario(event.target.value)}
            value={selectedScenarioId ?? ""}
          >
            {scenarios.length === 0 && (
              <option value="">No saved scenario</option>
            )}

            {scenarios.map((scenario) => (
              <option key={scenario.id} value={scenario.id}>
                {scenario.name}
              </option>
            ))}
          </select>
        </label>

        <button className="new-incident-button" onClick={onNewIncident} type="button">
          <span aria-hidden="true">+</span>
          New incident
        </button>
      </div>
    </header>
  );
}