import { create } from "zustand";
import { fetchSequence, postSequence, subscribeToSequence } from "../services/sequenceService.js";
import { validateSequence } from "../lib/algorithms.js";

const DEFAULT_SEQUENCE = [12, 3, 5, 43, 16, 15, 17, 0, 1, 5, 0, 89, 23];

export const useSequenceStore = create((set, get) => ({
  sequence: DEFAULT_SEQUENCE,
  status: "connecting", // "connecting" | "synced" | "offline"
  formError: "",

  init: async () => {
    try {
      const data = await fetchSequence();
      set({ sequence: data.sequence, status: "synced" });
    } catch {
      set({ status: "offline" }); // keep DEFAULT_SEQUENCE, work locally
    }

    subscribeToSequence(
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
    postSequence(arr).catch(() => set({ status: "offline" }));
  },
}));
