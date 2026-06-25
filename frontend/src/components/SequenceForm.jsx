import { useEffect, useRef } from "react";
import { useSequenceStore } from "../store/sequenceStore.js";

export default function SequenceForm() {
  const sequence = useSequenceStore((s) => s.sequence);
  const formError = useSequenceStore((s) => s.formError);
  const status = useSequenceStore((s) => s.status);
  const submit = useSequenceStore((s) => s.submit);
  const inputRef = useRef(null);

  // keep the input in sync with remote updates, but never while the user is typing
  useEffect(() => {
    if (document.activeElement !== inputRef.current) {
      inputRef.current.value = sequence.join(", ");
    }
  }, [sequence]);

  return (
    <form
      className="sequence-form"
      onSubmit={(ev) => {
        ev.preventDefault();
        submit(inputRef.current.value);
      }}
    >
      <label htmlFor="sequence-input">Input sequence</label>
      <input
        id="sequence-input"
        ref={inputRef}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        defaultValue={sequence.join(", ")}
        placeholder="e.g. 12, 3, 5, 43, 16, 15, 17, 0, 1, 5, 0, 89, 23"
      />
      <button type="submit">Generate</button>
      {status === "offline" && <span className="sync-badge">offline — not synced</span>}
      <p className="form-error">{formError}</p>
    </form>
  );
}
