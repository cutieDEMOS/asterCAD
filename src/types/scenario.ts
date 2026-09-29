export type ScenarioStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";

export interface Scenario {
  id: string;
  owner_id: string;
  name: string;
  description: string;
  status: ScenarioStatus;
  created_at: string;
  updated_at: string;
}