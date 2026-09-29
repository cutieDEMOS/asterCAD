import { supabase } from "./supabase";
import type { Scenario, ScenarioStatus } from "../types/scenario";

export interface CreateScenarioInput {
  name: string;
  description: string;
}

export async function listMyScenarios(): Promise<Scenario[]> {
  const { data, error } = await supabase
    .from("scenarios")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as Scenario[];
}

export async function createScenario(
  input: CreateScenarioInput,
): Promise<Scenario> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("You must be signed in to create a scenario.");
  }

  const { data, error } = await supabase
    .from("scenarios")
    .insert({
      owner_id: user.id,
      name: input.name.trim(),
      description: input.description.trim(),
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Scenario;
}

export async function updateScenario(
  scenarioId: string,
  input: Partial<Pick<Scenario, "name" | "description" | "status">>,
): Promise<Scenario> {
  const update: {
    name?: string;
    description?: string;
    status?: ScenarioStatus;
    updated_at: string;
  } = {
    updated_at: new Date().toISOString(),
  };

  if (input.name !== undefined) {
    update.name = input.name.trim();
  }

  if (input.description !== undefined) {
    update.description = input.description.trim();
  }

  if (input.status !== undefined) {
    update.status = input.status;
  }

  const { data, error } = await supabase
    .from("scenarios")
    .update(update)
    .eq("id", scenarioId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Scenario;
}

export async function deleteScenario(scenarioId: string): Promise<void> {
  const { error } = await supabase
    .from("scenarios")
    .delete()
    .eq("id", scenarioId);

  if (error) {
    throw new Error(error.message);
  }
}