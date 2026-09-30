import { useState, type FormEvent } from "react";
import type { CreateUnitInput } from "../types/unit";

interface CreateUnitModalProps {
  isOpen: boolean;
  isCreating: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onCreate: (input: CreateUnitInput) => void;
}

export function CreateUnitModal({
  isOpen,
  isCreating,
  errorMessage,
  onClose,
  onCreate,
}: CreateUnitModalProps) {
  const [callsign, setCallsign] = useState("");
  const [agency, setAgency] = useState<CreateUnitInput["agency"]>("POLICE");
  const [unitType, setUnitType] = useState("Patrol");
  const [zone, setZone] = useState("");

  if (!isOpen) {
    return null;
  }

  function close() {
    if (!isCreating) {
      onClose();
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!callsign.trim() || !unitType.trim()) {
      return;
    }

    onCreate({
      callsign: callsign.trim(),
      agency,
      unit_type: unitType.trim(),
      zone: zone.trim(),
    });
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section
        aria-labelledby="new-unit-title"
        aria-modal="true"
        className="modal"
        role="dialog"
      >
        <div className="modal-heading">
          <div>
            <p className="eyebrow">Scenario resources</p>
            <h2 id="new-unit-title">Add fictional unit</h2>
          </div>

          <button
            aria-label="Close form"
            className="icon-button"
            disabled={isCreating}
            onClick={close}
            type="button"
          >
            ×
          </button>
        </div>

        <form onSubmit={submit}>
          <label>
            Callsign
            <input
              autoFocus
              disabled={isCreating}
              maxLength={24}
              onChange={(event) => setCallsign(event.target.value)}
              placeholder="Example: PD-12"
              required
              value={callsign}
            />
          </label>

          <label>
            Agency
            <select
              disabled={isCreating}
              onChange={(event) =>
                setAgency(event.target.value as CreateUnitInput["agency"])
              }
              value={agency}
            >
              <option value="POLICE">Police</option>
              <option value="FIRE">Fire</option>
              <option value="EMS">EMS</option>
            </select>
          </label>

          <label>
            Unit type
            <input
              disabled={isCreating}
              maxLength={50}
              onChange={(event) => setUnitType(event.target.value)}
              placeholder="Example: Engine"
              required
              value={unitType}
            />
          </label>

          <label>
            Fictional zone or station
            <input
              disabled={isCreating}
              maxLength={80}
              onChange={(event) => setZone(event.target.value)}
              placeholder="Example: North Training District"
              value={zone}
            />
          </label>

          <p className="form-notice">
            Use fictional unit IDs, agencies, stations, zones, and personnel.
            This is a training simulator only.
          </p>

          {errorMessage && <p className="auth-error">{errorMessage}</p>}

          <div className="modal-actions">
            <button
              className="secondary-button"
              disabled={isCreating}
              onClick={close}
              type="button"
            >
              Cancel
            </button>

            <button className="primary-button" disabled={isCreating} type="submit">
              {isCreating ? "Adding…" : "Add unit"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}