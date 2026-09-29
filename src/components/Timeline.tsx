import type { CadEvent } from "../types/cad";

interface TimelineProps {
  events: CadEvent[];
}

function formatDateTime(dateValue: string): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(dateValue));
}

export function Timeline({ events }: TimelineProps) {
  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <section className="panel timeline">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Audit trail</p>
          <h2>Incident timeline</h2>
        </div>
      </div>

      {sortedEvents.length === 0 ? (
        <p className="empty-state">No timeline activity yet.</p>
      ) : (
        <ol className="timeline-list">
          {sortedEvents.map((event) => (
            <li key={event.id}>
              <time>{formatDateTime(event.createdAt)}</time>
              <p>{event.message}</p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}