import { useState, type FormEvent } from "react";
import type { CreateScenarioInput } from "../lib/scenarios";

interface CreateScenarioModalProps {
  isOpen: boolean;
  isCreating: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onCreate: (input: CreateScenarioInput) => void;
}

export function CreateScenarioModal({
  isOpen,
  isCreating,
  errorMessage,
  onClose,
  onCreate,
}: CreateScenarioModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  if (!isOpen) {
    return null;
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      return;
    }

    onCreate({
      name: trimmedName,
      description: description.trim(),
    });
  }

  function close() {
    if (!isCreating) {
      onClose();
    }
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section
        aria-labelledby="new-scenario-title"
        aria-modal="true"
        className="modal"
        role="dialog"
      >
        <div className="modal-heading">
          <div>
            <p className="eyebrow">Training setup</p>
            <h2 id="new-scenario-title">Create fictional scenario</h2>
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
            Scenario name
            <input
              autoFocus
              disabled={isCreating}
              maxLength={80}
              onChange={(event) => setName(event.target.value)}
              placeholder="Example: Saturday training shift"
              required
              value={name}
            />
          </label>

          <label>
            Description
            <textarea
              disabled={isCreating}
              maxLength={500}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Use fictional calls, people, and locations only."
              rows={4}
              value={description}
            />
          </label>

          <p className="form-notice">
            Training/simulation only. Do not enter real 911, medical, police,
            fire, EMS, or personal data.
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
              {isCreating ? "Creating…" : "Create scenario"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}