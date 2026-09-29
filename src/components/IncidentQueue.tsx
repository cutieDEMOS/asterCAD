import type { Incident } from "../types/cad";

interface IncidentQueueProps {
  incidents: Incident[];
  selectedIncidentId: string | null;
  onSelect: (incidentId: string) => void;
}

function formatTime(dateValue: string): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateValue));
}

export function IncidentQueue({
  incidents,
  selectedIncidentId,
  onSelect,
}: IncidentQueueProps) {
  const activeIncidents = incidents
    .filter((incident) => incident.status !== "CLOSED")
    .sort((a, b) => a.priority - b.priority);

  return (
    <section className="panel incident-queue">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Dispatch queue</p>
          <h2>Active calls</h2>
        </div>
        <span className="count-badge">{activeIncidents.length}</span>
      </div>

      <div className="incident-list">
        {activeIncidents.map((incident) => (
          <button
            className={`incident-card ${
              selectedIncidentId === incident.id ? "selected" : ""
            }`}
            key={incident.id}
            onClick={() => onSelect(incident.id)}
            type="button"
          >
            <span className={`priority priority-${incident.priority}`}>
              P{incident.priority}
            </span>

            <span className="incident-card-content">
              <strong>{incident.typeCode.replaceAll("_", " ")}</strong>
              <small>{incident.location}</small>
              <small>
                {incident.incidentNumber} · {formatTime(incident.createdAt)}
              </small>
            </span>

            <span className="incident-status">{incident.status}</span>
          </button>
        ))}

        {activeIncidents.length === 0 && (
          <p className="empty-state">No active training calls.</p>
        )}
      </div>
    </section>
  );
}