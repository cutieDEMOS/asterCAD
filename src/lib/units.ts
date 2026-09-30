import { supabase } from "./supabase";
import type {
  CreateUnitInput,
  ScenarioUnit,
  UnitStatus,
} from "../types/unit";

export async function listScenarioUnits(
  scenarioId: string,
): Promise<ScenarioUnit[]> {
  const { data, error } = await supabase
    .from("units")
    .select("*")
    .eq("scenario_id", scenarioId)
    .order("callsign", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data as ScenarioUnit[];
}

export async function createScenarioUnit(
  scenarioId: string,
  input: CreateUnitInput,
): Promise<ScenarioUnit> {
  const { data, error } = await supabase
    .from("units")
    .insert({
      scenario_id: scenarioId,
      callsign: input.callsign.trim().toUpperCase(),
      agency: input.agency,
      unit_type: input.unit_type.trim(),
      zone: input.zone.trim(),
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as ScenarioUnit;
}

export async function updateScenarioUnitStatus(
  unitId: string,
  status: UnitStatus,
): Promise<ScenarioUnit> {
  const { data, error } = await supabase
    .from("units")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", unitId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as ScenarioUnit;
}

export async function deleteScenarioUnit(unitId: string): Promise<void> {
  const { error } = await supabase.from("units").delete().eq("id", unitId);

  if (error) {
    throw new Error(error.message);
  }
}