export type Agency = "POLICE" | "FIRE" | "EMS";

export type UnitStatus =
  | "AVAILABLE"
  | "ASSIGNED"
  | "EN_ROUTE"
  | "ON_SCENE"
  | "TRANSPORTING"
  | "AT_HOSPITAL"
  | "CLEARING"
  | "OUT_OF_SERVICE";

export type IncidentStatus =
  | "NEW"
  | "QUEUED"
  | "DISPATCHED"
  | "CLOSED";

export type Priority = 1 | 2 | 3 | 4;

export type EventType =
  | "INCIDENT_CREATED"
  | "UNIT_ASSIGNED"
  | "UNIT_STATUS_CHANGED"
  | "NOTE_ADDED"
  | "INCIDENT_CLOSED";

export interface Unit {
  id: string;
  callsign: string;
  agency: Agency;
  type: string;
  status: UnitStatus;
  zone: string;
  assignedIncidentId: string | null;
}

export interface Incident {
  id: string;
  incidentNumber: string;
  typeCode: string;
  priority: Priority;
  status: IncidentStatus;
  location: string;
  narrative: string;
  createdAt: string;
  closedAt: string | null;
  assignedUnitIds: string[];
}

export interface CadEvent {
  id: string;
  incidentId: string;
  unitId: string | null;
  type: EventType;
  message: string;
  createdAt: string;
}

export interface CadState {
  units: Unit[];
  incidents: Incident[];
  events: CadEvent[];
}