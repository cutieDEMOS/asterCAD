import { useEffect, useMemo, useState } from "react";
import { IncidentDetails } from "./components/IncidentDetails";
import { IncidentQueue } from "./components/IncidentQueue";
import { NewIncidentModal } from "./components/NewIncidentModal";
import { Timeline } from "./components/Timeline";
import { UnitBoard } from "./components/UnitBoard";
import { loadCadState, resetCadState, saveCadState } from "./lib/storage";
import type {
  CadEvent,
  CadState,
  Incident,
  Priority,
  UnitStatus,
} from "./types/cad";

function createId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

function now(): string {
  return new Date().toISOString();
}

function incidentNumber(): string {
  const date = new Date();
  const datePart = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("");

  const sequence = String(Math.floor(Math.random() * 9000) + 1000);

  return `SIM-${datePart}-${sequence}`;
}

function readableStatus(status: string): string {
  return status.replaceAll("_", " ");
}

export default function App() {
  const [cadState, setCadState] = useState<CadState>(() => loadCadState());
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(
    () => loadCadState().incidents.find((incident) => incident.status !== "CLOSED")
      ?.id ?? null,
  );
  const [isNewCallOpen, setIsNewCallOpen] = useState(false);

  useEffect(() => {
    saveCadState(cadState);
  }, [cadState]);

  const selectedIncident = useMemo(
    () =>
      cadState.incidents.find((incident) => incident.id === selectedIncidentId) ??
      null,
    [cadState.incidents, selectedIncidentId],
  );

  const selectedEvents = useMemo(() => {
    if (!selectedIncidentId) {
      return [];
    }

    return cadState.events.filter(
      (event) => event.incidentId === selectedIncidentId,
    );
  }, [cadState.events, selectedIncidentId]);

  function addEvent(event: Omit<CadEvent, "id" | "createdAt">): CadEvent {
    return {
      ...event,
      id: createId("event"),
      createdAt: now(),
    };
  }

  function updateUnitStatus(unitId: string, nextStatus: UnitStatus) {
    setCadState((current) => {
      const unit = current.units.find((item) => item.id === unitId);

      if (!unit || unit.status === nextStatus) {
        return current;
      }

      const updatedUnits = current.units.map((item) =>
        item.id === unitId ? { ...item, status: nextStatus } : item,
      );

      const newEvents = [...current.events];

      if (unit.assignedIncidentId) {
        newEvents.push(
          addEvent({
            incidentId: unit.assignedIncidentId,
            unitId,
            type: "UNIT_STATUS_CHANGED",
            message: `${unit.callsign} status changed to ${readableStatus(
              nextStatus,
            )}.`,
          }),
        );
      }

      return {
        ...current,
        units: updatedUnits,
        events: newEvents,
      };
    });
  }

  function assignUnit(unitId: string) {
    if (!selectedIncidentId) {
      return;
    }

    setCadState((current) => {
      const unit = current.units.find((item) => item.id === unitId);
      const incident = current.incidents.find(
        (item) => item.id === selectedIncidentId,
      );

      if (
        !unit ||
        !incident ||
        unit.status !== "AVAILABLE" ||
        incident.assignedUnitIds.includes(unitId)
      ) {
        return current;
      }

      const updatedUnits = current.units.map((item) =>
        item.id === unitId
          ? {
              ...item,
              assignedIncidentId: incident.id,
              status: "ASSIGNED" as UnitStatus,
            }
          : item,
      );

      const updatedIncidents = current.incidents.map((item) =>
        item.id === incident.id
          ? {
              ...item,
              status: "DISPATCHED" as const,
              assignedUnitIds: [...item.assignedUnitIds, unitId],
            }
          : item,
      );

      return {
        ...current,
        units: updatedUnits,
        incidents: updatedIncidents,
        events: [
          ...current.events,
          addEvent({
            incidentId: incident.id,
            unitId,
            type: "UNIT_ASSIGNED",
            message: `${unit.callsign} assigned to incident.`,
          }),
        ],
      };
    });
  }

  function createIncident(input: {
    typeCode: string;
    priority: Priority;
    location: string;
    narrative: string;
  }) {
    const id = createId("incident");

    const incident: Incident = {
      id,
      incidentNumber: incidentNumber(),
      typeCode: input.typeCode,
      priority: input.priority,
      status: "QUEUED",
      location: input.location,
      narrative: input.narrative,
      createdAt: now(),
      closedAt: null,
      assignedUnitIds: [],
    };

    setCadState((current) => ({
      ...current,
      incidents: [incident, ...current.incidents],
      events: [
        ...current.events,
        addEvent({
          incidentId: id,
          unitId: null,
          type: "INCIDENT_CREATED",
          message: `Incident created: ${input.typeCode.replaceAll(
            "_",
            " ",
          )}, priority ${input.priority}.`,
        }),
      ],
    }));

    setSelectedIncidentId(id);
  }

  function closeSelectedIncident() {
    if (!selectedIncidentId) {
      return;
    }

    setCadState((current) => {
      const incident = current.incidents.find(
        (item) => item.id === selectedIncidentId,
      );

      if (!incident || incident.status === "CLOSED") {
        return current;
      }

      const updatedUnits = current.units.map((unit) =>
        unit.assignedIncidentId === incident.id
          ? {
              ...unit,
              status: "AVAILABLE" as UnitStatus,
              assignedIncidentId: null,
            }
          : unit,
      );

      const updatedIncidents = current.incidents.map((item) =>
        item.id === incident.id
          ? {
              ...item,
              status: "CLOSED" as const,
              closedAt: now(),
            }
          : item,
      );

      return {
        ...current,
        units: updatedUnits,
        incidents: updatedIncidents,
        events: [
          ...current.events,
          addEvent({
            incidentId: incident.id,
            unitId: null,
            type: "INCIDENT_CLOSED",
            message: "Training incident closed. Assigned units returned to Available.",
          }),
        ],
      };
    });

    setSelectedIncidentId(null);
  }

  function resetScenario() {
    const resetState = resetCadState();
    setCadState(resetState);
    setSelectedIncidentId(
      resetState.incidents.find((incident) => incident.status !== "CLOSED")?.id ??
        null,
    );
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">cutieDEMOS</p>
          <h1>cutieCAD</h1>
          <p className="subtitle">
            Public-safety dispatch simulator · Training use only
          </p>
        </div>

        <div className="topbar-actions">
          <button className="secondary-button" onClick={resetScenario} type="button">
            Reset scenario
          </button>
          <button
            className="primary-button"
            onClick={() => setIsNewCallOpen(true)}
            type="button"
          >
            + New simulated call
          </button>
        </div>
      </header>

      <div className="safety-banner">
        This is a fictional training/demo interface. It is not connected to 911,
        public-safety agencies, radio systems, or real emergency responders.
      </div>

      <div className="cad-grid">
        <IncidentQueue
          incidents={cadState.incidents}
          selectedIncidentId={selectedIncidentId}
          onSelect={setSelectedIncidentId}
        />

        <IncidentDetails
          incident={selectedIncident}
          units={cadState.units}
          onAssignUnit={assignUnit}
          onCloseIncident={closeSelectedIncident}
        />

        <UnitBoard units={cadState.units} onStatusChange={updateUnitStatus} />

        <Timeline events={selectedEvents} />
      </div>

      <NewIncidentModal
        isOpen={isNewCallOpen}
        onClose={() => setIsNewCallOpen(false)}
        onCreate={createIncident}
      />
    </main>
  );
}