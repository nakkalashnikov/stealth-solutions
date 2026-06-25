import { create } from "zustand";
import { fetchSequence, postSequence, subscribeToSequence } from "../services/sequenceService.js";
import { validateSequence } from "../lib/algorithms.js";

// Factory so Task 1 and Task 2 each get their own independent store/resource
// (separate API path, separate SSE stream, separate offline status) without
// duplicating this logic by hand.
export function createSequenceStore(resourcePath, defaultSequence) {
  return create((set, get) => ({
    sequence: defaultSequence,
    status: "connecting", // "connecting" | "synced" | "offline"
    formError: "",

    init: async () => {
      try {
        const data = await fetchSequence(resourcePath);
        set({ sequence: data.sequence, status: "synced" });
      } catch {
        set({ status: "offline" }); // keep defaultSequence, work locally
      }

      subscribeToSequence(
        resourcePath,
        (data) => {
          // ignore late pushes that just confirm the value we already have
          if (JSON.stringify(data.sequence) !== JSON.stringify(get().sequence)) {
            set({ sequence: data.sequence });
          }
        },
        (status) => set({ status })
      );
    },

    submit: (rawText) => {
      const arr = rawText
        .split(/[\s,]+/)
        .filter((s) => s.length > 0)
        .map(Number);

      const error = validateSequence(arr);
      if (error) {
        set({ formError: error });
        return;
      }

      set({ sequence: arr, formError: "" }); // optimistic
      postSequence(resourcePath, arr).catch(() => set({ status: "offline" }));
    },
  }));
}

export const useSequenceStore = createSequenceStore("sequence", [12, 3, 5, 43, 16, 15, 17, 0, 1, 5, 0, 89, 23]);
export const useBstSequenceStore = createSequenceStore(
  "bst-sequence",
  [19, 3, 31, 1, 27, 17, 21, 16, 18, 15, 22, 37, 25, 11, 26, 2, 98]
);
