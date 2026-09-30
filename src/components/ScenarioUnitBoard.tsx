import type { ScenarioUnit, UnitStatus } from "../types/unit";

interface ScenarioUnitBoardProps {
  units: ScenarioUnit[];
  isLoading: boolean;
  errorMessage: string | null;
  onAddUnit: () => void;
  onDeleteUnit: (unit: ScenarioUnit) => void;
  onStatusChange: (unitId: string, status: UnitStatus) => void;
}

const statuses: UnitStatus[] = [
  "AVAILABLE",
  "ASSIGNED",
  "EN_ROUTE",
  "ON_SCENE",
  "TRANSPORTING",
  "AT_HOSPITAL",
  "CLEARING",
  "OUT_OF_SERVICE",
];

function readableStatus(status: UnitStatus): string {
  return status.replaceAll("_", " ");
}

export function ScenarioUnitBoard({
  units,
  isLoading,
  errorMessage,
  onAddUnit,
  onDeleteUnit,
  onStatusChange,
}: ScenarioUnitBoardProps) {
  return (
    <section className="panel scenario-unit-board">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Scenario resources</p>
          <h2>Saved units</h2>
        </div>

        <button className="primary-button compact-button" onClick={onAddUnit} type="button">
          + Add unit
        </button>
      </div>

      {isLoading && <p className="empty-state">Loading scenario units…</p>}

      {!isLoading && errorMessage && (
        <p className="auth-error panel-message">{errorMessage}</p>
      )}

      {!isLoading && !errorMessage && units.length === 0 && (
        <div className="empty-state">
          <p>No units saved for this scenario.</p>
          <p>Add fictional police, fire, or EMS units to begin.</p>
        </div>
      )}

      {!isLoading && !errorMessage && units.length > 0 && (
        <div className="scenario-unit-list">
          {units.map((unit) => (
            <article className="scenario-unit-row" key={unit.id}>
              <div className="scenario-unit-identity">
                <span className={`agency-tag ${unit.agency.toLowerCase()}`}>
                  {unit.agency}
                </span>

                <div>
                  <strong>{unit.callsign}</strong>
                  <small>
                    {unit.unit_type}
                    {unit.zone ? ` · ${unit.zone}` : ""}
                  </small>
                </div>
              </div>

              <div className="scenario-unit-actions">
                <select
                  aria-label={`Change ${unit.callsign} status`}
                  className={`status-select status-${unit.status.toLowerCase()}`}
                  onChange={(event) =>
                    onStatusChange(unit.id, event.target.value as UnitStatus)
                  }
                  value={unit.status}
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {readableStatus(status)}
                    </option>
                  ))}
                </select>

                <button
                  aria-label={`Delete ${unit.callsign}`}
                  className="table-delete-button"
                  onClick={() => onDeleteUnit(unit)}
                  type="button"
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}