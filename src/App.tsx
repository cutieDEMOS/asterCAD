import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";

import { AppSidebar, type AppPage } from "./components/AppSidebar";
import { AuthPanel } from "./components/AuthPanel";
import { ConsoleHeader } from "./components/ConsoleHeader";
import { CreateScenarioModal } from "./components/CreateScenarioModal";
import { IncidentDetails } from "./components/IncidentDetails";
import { IncidentQueue } from "./components/IncidentQueue";
import { NewIncidentModal } from "./components/NewIncidentModal";
import { ScenarioPanel } from "./components/ScenarioPanel";
import { Timeline } from "./components/Timeline";
import { UnitBoard } from "./components/UnitBoard";

import {
  createScenario,
  deleteScenario,
  listMyScenarios,
  type CreateScenarioInput,
} from "./lib/scenarios";
import { loadCadState, resetCadState, saveCadState } from "./lib/storage";
import { supabase } from "./lib/supabase";

import type { Scenario } from "./types/scenario";
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
    () =>
      loadCadState().incidents.find((incident) => incident.status !== "CLOSED")
        ?.id ?? null,
  );

  const [activePage, setActivePage] = useState<AppPage>("DASHBOARD");
  const [isNewCallOpen, setIsNewCallOpen] = useState(false);

  const [session, setSession] = useState<Session | null>(null);

  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(
    null,
  );

  const [isScenariosLoading, setIsScenariosLoading] = useState(false);
  const [scenarioError, setScenarioError] = useState<string | null>(null);

  const [isCreateScenarioOpen, setIsCreateScenarioOpen] = useState(false);
  const [isCreatingScenario, setIsCreatingScenario] = useState(false);

  useEffect(() => {
    saveCadState(cadState);
  }, [cadState]);

  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      const {
        data: { session: nextSession },
      } = await supabase.auth.getSession();

      if (isMounted) {
        setSession(nextSession);
      }
    }

    void restoreSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);

      if (!nextSession) {
        setScenarios([]);
        setSelectedScenarioId(null);
        setScenarioError(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session) {
      return;
    }

    async function loadScenarios() {
      setIsScenariosLoading(true);
      setScenarioError(null);

      try {
        const nextScenarios = await listMyScenarios();

        setScenarios(nextScenarios);

        setSelectedScenarioId((currentSelectedId) => {
          const selectedScenarioStillExists = nextScenarios.some(
            (scenario) => scenario.id === currentSelectedId,
          );

          if (selectedScenarioStillExists) {
            return currentSelectedId;
          }

          return nextScenarios[0]?.id ?? null;
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unable to load scenarios.";

        setScenarioError(message);
      } finally {
        setIsScenariosLoading(false);
      }
    }

    void loadScenarios();
  }, [session]);

  const selectedIncident = useMemo(() => {
    return (
      cadState.incidents.find(
        (incident) => incident.id === selectedIncidentId,
      ) ?? null
    );
  }, [cadState.incidents, selectedIncidentId]);

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
            message:
              "Training incident closed. Assigned units returned to Available.",
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
      resetState.incidents.find((incident) => incident.status !== "CLOSED")
        ?.id ?? null,
    );
  }

  async function handleCreateScenario(input: CreateScenarioInput) {
    setIsCreatingScenario(true);
    setScenarioError(null);

    try {
      const createdScenario = await createScenario(input);

      setScenarios((current) => [createdScenario, ...current]);
      setSelectedScenarioId(createdScenario.id);
      setIsCreateScenarioOpen(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to create scenario.";

      setScenarioError(message);
    } finally {
      setIsCreatingScenario(false);
    }
  }

  async function handleDeleteScenario(scenario: Scenario) {
    const confirmed = window.confirm(
      `Delete "${scenario.name}"? This cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    setScenarioError(null);

    try {
      await deleteScenario(scenario.id);

      const nextScenarios = scenarios.filter(
        (item) => item.id !== scenario.id,
      );

      setScenarios(nextScenarios);

      setSelectedScenarioId((currentSelectedId) => {
        if (currentSelectedId !== scenario.id) {
          return currentSelectedId;
        }

        return nextScenarios[0]?.id ?? null;
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to delete scenario.";

      setScenarioError(message);
    }
  }

  function openCreateScenarioModal() {
    setScenarioError(null);
    setIsCreateScenarioOpen(true);
  }

  function renderMainPage() {
    if (activePage === "DASHBOARD") {
      return (
        <>
          {session ? (
            <ScenarioPanel
              errorMessage={scenarioError}
              isLoading={isScenariosLoading}
              onCreate={openCreateScenarioModal}
              onDelete={(scenario) => void handleDeleteScenario(scenario)}
              onSelect={setSelectedScenarioId}
              scenarios={scenarios}
              selectedScenarioId={selectedScenarioId}
            />
          ) : (
            <section className="panel signed-out-scenarios">
              <p className="eyebrow">Optional account feature</p>
              <h2>Sign in to save training scenarios</h2>
              <p className="empty-state">
                You can still use the local fictional demo without an account.
                Sign in to create and manage private training scenarios.
              </p>
            </section>
          )}

          <div className="dispatch-dashboard-grid">
            <IncidentQueue
              incidents={cadState.incidents}
              onSelect={setSelectedIncidentId}
              selectedIncidentId={selectedIncidentId}
            />

            <IncidentDetails
              incident={selectedIncident}
              onAssignUnit={assignUnit}
              onCloseIncident={closeSelectedIncident}
              units={cadState.units}
            />

            <UnitBoard
              onStatusChange={updateUnitStatus}
              units={cadState.units}
            />

            <Timeline events={selectedEvents} />
          </div>
        </>
      );
    }

    if (activePage === "INCIDENTS") {
      return (
        <section className="panel page-placeholder">
          <p className="eyebrow">Incident management</p>
          <h2>Incidents</h2>
          <p>
            This page will become a full fictional incident table with filters,
            sorting, notes, assignments, and printable training summaries.
          </p>
        </section>
      );
    }

    if (activePage === "UNITS") {
      return (
        <section className="panel page-placeholder">
          <p className="eyebrow">Resource management</p>
          <h2>Units</h2>

          <UnitBoard
            onStatusChange={updateUnitStatus}
            units={cadState.units}
          />
        </section>
      );
    }

    if (activePage === "PERSONNEL") {
      return (
        <section className="panel page-placeholder">
          <p className="eyebrow">Fictional roster</p>
          <h2>Personnel</h2>
          <p>
            This page will contain fictional personnel profiles,
            qualifications, schedules, and unit assignments. Do not add real
            agency personnel information.
          </p>
        </section>
      );
    }

    if (activePage === "SCENARIOS") {
      if (!session) {
        return (
          <section className="panel signed-out-scenarios">
            <p className="eyebrow">Sign-in required</p>
            <h2>Private scenarios</h2>
            <p className="empty-state">
              Sign in with GitHub or email to create private fictional training
              scenarios.
            </p>
          </section>
        );
      }

      return (
        <ScenarioPanel
          errorMessage={scenarioError}
          isLoading={isScenariosLoading}
          onCreate={openCreateScenarioModal}
          onDelete={(scenario) => void handleDeleteScenario(scenario)}
          onSelect={setSelectedScenarioId}
          scenarios={scenarios}
          selectedScenarioId={selectedScenarioId}
        />
      );
    }

    return (
      <section className="panel page-placeholder">
        <p className="eyebrow">Application configuration</p>
        <h2>Settings</h2>
        <p>
          This page will later contain display preferences, fictional default
          unit states, scenario defaults, and other training-only settings.
        </p>
      </section>
    );
  }

  return (
    <div className="console-layout">
      <AppSidebar activePage={activePage} onNavigate={setActivePage} />

      <main className="console-main">
        <ConsoleHeader
          onNewIncident={() => setIsNewCallOpen(true)}
          onSelectScenario={setSelectedScenarioId}
          scenarios={scenarios}
          selectedScenarioId={selectedScenarioId}
        />

        <div className="console-safety-strip">
          <span>Training / Simulation Only</span>
          Fictional data only. This system does not contact 911, dispatch
          agencies, radio systems, or emergency responders.
        </div>

        <div className="console-content">
          <div className="console-utility-bar">
            <AuthPanel />

            <button
              className="secondary-button"
              onClick={resetScenario}
              type="button"
            >
              Reset local demo
            </button>
          </div>

          {renderMainPage()}
        </div>

        <NewIncidentModal
          isOpen={isNewCallOpen}
          onClose={() => setIsNewCallOpen(false)}
          onCreate={createIncident}
        />

        <CreateScenarioModal
          errorMessage={scenarioError}
          isCreating={isCreatingScenario}
          isOpen={isCreateScenarioOpen}
          onClose={() => setIsCreateScenarioOpen(false)}
          onCreate={(input) => void handleCreateScenario(input)}
        />
      </main>
    </div>
  );
}