import type { Unit, UnitStatus } from "../types/cad";

interface UnitBoardProps {
  units: Unit[];
  onStatusChange: (unitId: string, nextStatus: UnitStatus) => void;
}

const statusOptions: UnitStatus[] = [
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

export function UnitBoard({ units, onStatusChange }: UnitBoardProps) {
  const sortedUnits = [...units].sort((a, b) =>
    a.callsign.localeCompare(b.callsign),
  );

  return (
    <section className="panel unit-board">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Resource status</p>
          <h2>Unit board</h2>
        </div>
        <span className="count-badge">{units.length}</span>
      </div>

      <div className="unit-list">
        {sortedUnits.map((unit) => (
          <article className="unit-row" key={unit.id}>
            <div className="unit-title">
              <span className={`agency-tag ${unit.agency.toLowerCase()}`}>
                {unit.agency}
              </span>
              <div>
                <strong>{unit.callsign}</strong>
                <small>
                  {unit.type} · {unit.zone}
                </small>
              </div>
            </div>

            <select
              aria-label={`Change ${unit.callsign} status`}
              className={`status-select status-${unit.status.toLowerCase()}`}
              value={unit.status}
              onChange={(event) =>
                onStatusChange(unit.id, event.target.value as UnitStatus)
              }
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {readableStatus(status)}
                </option>
              ))}
            </select>
          </article>
        ))}
      </div>
    </section>
  );
}