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

export interface ScenarioUnit {
  id: string;
  scenario_id: string;
  callsign: string;
  agency: Agency;
  unit_type: string;
  status: UnitStatus;
  zone: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUnitInput {
  callsign: string;
  agency: Agency;
  unit_type: string;
  zone: string;
}