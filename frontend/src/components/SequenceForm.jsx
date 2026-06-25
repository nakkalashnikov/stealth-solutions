import { useEffect, useRef } from "react";

export default function SequenceForm({ useStore, inputId, label, placeholder }) {
  const sequence = useStore((s) => s.sequence);
  const formError = useStore((s) => s.formError);
  const status = useStore((s) => s.status);
  const submit = useStore((s) => s.submit);
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
      <label htmlFor={inputId}>{label}</label>
      <input
        id={inputId}
        ref={inputRef}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        defaultValue={sequence.join(", ")}
        placeholder={placeholder}
      />
      <button type="submit">Generate</button>
      {status === "offline" && <span className="sync-badge">offline — not synced</span>}
      <p className="form-error">{formError}</p>
    </form>
  );
}
