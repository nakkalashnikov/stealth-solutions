import { useEffect, useRef } from "react";
import { useKnapsackStore, formatKnapsackInput } from "../store/knapsackStore.js";

export default function KnapsackForm() {
  const value = useKnapsackStore((s) => s.value);
  const formError = useKnapsackStore((s) => s.formError);
  const status = useKnapsackStore((s) => s.status);
  const submit = useKnapsackStore((s) => s.submit);
  const capacityRef = useRef(null);
  const itemsRef = useRef(null);

  useEffect(() => {
    const { capacityText, itemsText } = formatKnapsackInput(value);
    if (document.activeElement !== capacityRef.current) capacityRef.current.value = capacityText;
    if (document.activeElement !== itemsRef.current) itemsRef.current.value = itemsText;
  }, [value]);

  return (
    <form
      className="sequence-form"
      onSubmit={(ev) => {
        ev.preventDefault();
        submit(capacityRef.current.value, itemsRef.current.value);
      }}
    >
      <label htmlFor="knapsack-capacity">Capacity (b)</label>
      <input id="knapsack-capacity" ref={capacityRef} type="text" inputMode="numeric"
             autoComplete="off" placeholder="e.g. 9" style={{ maxWidth: "5rem" }} />

      <label htmlFor="knapsack-items">Items (size:value, size:value, ...)</label>
      <input id="knapsack-items" ref={itemsRef} type="text" autoComplete="off"
             placeholder="e.g. 6:3, 2:2, 2:5, 1:2, 7:24, 12:44" />

      <button type="submit">Generate</button>
      {status === "offline" && <span className="sync-badge">offline — not synced</span>}
      <p className="form-error">{formError}</p>
    </form>
  );
}
