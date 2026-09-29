import { initialCadState } from "../data/seed";
import type { CadState } from "../types/cad";

const STORAGE_KEY = "cutiecad-simulator-state-v1";

export function loadCadState(): CadState {
  const stored = window.localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return initialCadState;
  }

  try {
    return JSON.parse(stored) as CadState;
  } catch {
    return initialCadState;
  }
}

export function saveCadState(state: CadState): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetCadState(): CadState {
  window.localStorage.removeItem(STORAGE_KEY);
  return initialCadState;
}