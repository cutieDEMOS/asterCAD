import { useState, type FormEvent } from "react";
import type { Priority } from "../types/cad";

interface NewIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (input: {
    typeCode: string;
    priority: Priority;
    location: string;
    narrative: string;
  }) => void;
}

export function NewIncidentModal({
  isOpen,
  onClose,
  onCreate,
}: NewIncidentModalProps) {
  const [typeCode, setTypeCode] = useState("MEDICAL");
  const [priority, setPriority] = useState<Priority>(2);
  const [location, setLocation] = useState("");
  const [narrative, setNarrative] = useState("");

  if (!isOpen) {
    return null;
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!location.trim() || !narrative.trim()) {
      return;
    }

    onCreate({
      typeCode,
      priority,
      location: location.trim(),
      narrative: narrative.trim(),
    });

    setTypeCode("MEDICAL");
    setPriority(2);
    setLocation("");
    setNarrative("");
    onClose();
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section
        aria-labelledby="new-call-title"
        aria-modal="true"
        className="modal"
        role="dialog"
      >
        <div className="modal-heading">
          <div>
            <p className="eyebrow">Training scenario</p>
            <h2 id="new-call-title">Create simulated call</h2>
          </div>
          <button
            aria-label="Close form"
            className="icon-button"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>

        <form onSubmit={submit}>
          <label>
            Call type
            <select
              value={typeCode}
              onChange={(event) => setTypeCode(event.target.value)}
            >
              <option value="MEDICAL">Medical</option>
              <option value="FIRE_ALARM">Fire alarm</option>
              <option value="STRUCTURE_FIRE">Structure fire</option>
              <option value="DISTURBANCE">Disturbance</option>
              <option value="WELFARE_CHECK">Welfare check</option>
              <option value="TRAFFIC_COLLISION">Traffic collision</option>
            </select>
          </label>

          <label>
            Priority
            <select
              value={priority}
              onChange={(event) =>
                setPriority(Number(event.target.value) as Priority)
              }
            >
              <option value={1}>Priority 1 — Immediate</option>
              <option value={2}>Priority 2 — Urgent</option>
              <option value={3}>Priority 3 — Routine</option>
              <option value={4}>Priority 4 — Low</option>
            </select>
          </label>

          <label>
            Fictional location
            <input
              placeholder="Example: 250 Training Lane, Demo City"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
            />
          </label>

          <label>
            Training narrative
            <textarea
              placeholder="Describe the fictional scenario..."
              rows={4}
              value={narrative}
              onChange={(event) => setNarrative(event.target.value)}
            />
          </label>

          <div className="modal-actions">
            <button className="secondary-button" onClick={onClose} type="button">
              Cancel
            </button>
            <button className="primary-button" type="submit">
              Create call
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}