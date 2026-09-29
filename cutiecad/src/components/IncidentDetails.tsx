import type { Incident, Unit } from "../types/cad";

interface IncidentDetailsProps {
  incident: Incident | null;
  units: Unit[];
  onAssignUnit: (unitId: string) => void;
  onCloseIncident: () => void;
}

function readableType(value: string): string {
  return value.replaceAll("_", " ");
}

export function IncidentDetails({
  incident,
  units,
  onAssignUnit,
  onCloseIncident,
}: IncidentDetailsProps) {
  if (!incident) {
    return (
      <section className="panel incident-details">
        <p className="empty-state">
          Select a call from the queue to view its details.
        </p>
      </section>
    );
  }

  const assignedUnits = units.filter((unit) =>
    incident.assignedUnitIds.includes(unit.id),
  );

  const availableUnits = units.filter(
    (unit) =>
      unit.status === "AVAILABLE" && !incident.assignedUnitIds.includes(unit.id),
  );

  return (
    <section className="panel incident-details">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">{incident.incidentNumber}</p>
          <h2>{readableType(incident.typeCode)}</h2>
        </div>
        <span className={`priority priority-${incident.priority}`}>
          Priority {incident.priority}
        </span>
      </div>

      <dl className="details-grid">
        <div>
          <dt>Status</dt>
          <dd>{incident.status}</dd>
        </div>
        <div>
          <dt>Location</dt>
          <dd>{incident.location}</dd>
        </div>
        <div className="full-width">
          <dt>Narrative</dt>
          <dd>{incident.narrative}</dd>
        </div>
      </dl>

      <div className="details-section">
        <h3>Assigned units</h3>
        {assignedUnits.length === 0 ? (
          <p className="empty-state">No units assigned.</p>
        ) : (
          <div className="assigned-unit-list">
            {assignedUnits.map((unit) => (
              <span className="assigned-unit" key={unit.id}>
                {unit.callsign} · {unit.status.replaceAll("_", " ")}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="details-section">
        <h3>Dispatch available unit</h3>
        <div className="assign-buttons">
          {availableUnits.map((unit) => (
            <button
              className="secondary-button"
              key={unit.id}
              onClick={() => onAssignUnit(unit.id)}
              type="button"
            >
              Assign {unit.callsign}
            </button>
          ))}

          {availableUnits.length === 0 && (
            <p className="empty-state">No units are currently available.</p>
          )}
        </div>
      </div>

      {incident.status !== "CLOSED" && (
        <button className="danger-button" onClick={onCloseIncident} type="button">
          Close training incident
        </button>
      )}
    </section>
  );
}