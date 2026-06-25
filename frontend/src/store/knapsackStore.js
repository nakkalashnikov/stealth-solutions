import { create } from "zustand";
import { fetchSequence, postSequence, subscribeToSequence } from "../services/sequenceService.js";
import { MIN_ITEMS, MAX_ITEMS } from "../lib/knapsack.js";

const RESOURCE_PATH = "knapsack";
const DEFAULT_VALUE = {
  capacity: 9,
  items: [
    { size: 6, value: 3 }, { size: 2, value: 2 }, { size: 2, value: 5 },
    { size: 1, value: 2 }, { size: 7, value: 24 }, { size: 12, value: 44 },
  ],
};

// Items are typed as "size:value, size:value, ..." — parses that into the
// {capacity, items} shape the backend/lib expect, or returns an error string.
export function parseKnapsackInput(capacityText, itemsText) {
  const capacity = Number(capacityText);
  if (!Number.isFinite(capacity) || capacity <= 0) {
    return { error: "Capacity must be a positive number." };
  }

  const pairs = itemsText.split(",").map((s) => s.trim()).filter((s) => s.length > 0);
  if (pairs.length < MIN_ITEMS || pairs.length > MAX_ITEMS) {
    return { error: `Enter between ${MIN_ITEMS} and ${MAX_ITEMS} items.` };
  }

  const items = [];
  for (const pair of pairs) {
    const match = pair.match(/^(-?\d+(\.\d+)?):(-?\d+(\.\d+)?)$/);
    if (!match) return { error: `"${pair}" isn't a valid "size:value" pair.` };
    const size = Number(match[1]), value = Number(match[3]);
    if (size <= 0 || value <= 0) return { error: `"${pair}" must have a positive size and value.` };
    items.push({ size, value });
  }

  return { capacity, items };
}

export function formatKnapsackInput({ capacity, items }) {
  return { capacityText: String(capacity), itemsText: items.map((i) => `${i.size}:${i.value}`).join(", ") };
}

export const useKnapsackStore = create((set, get) => ({
  value: DEFAULT_VALUE,
  status: "connecting",
  formError: "",

  init: async () => {
    try {
      const data = await fetchSequence(RESOURCE_PATH);
      set({ value: data.sequence, status: "synced" });
    } catch {
      set({ status: "offline" });
    }

    subscribeToSequence(
      RESOURCE_PATH,
      (data) => {
        if (JSON.stringify(data.sequence) !== JSON.stringify(get().value)) {
          set({ value: data.sequence });
        }
      },
      (status) => set({ status })
    );
  },

  submit: (capacityText, itemsText) => {
    const result = parseKnapsackInput(capacityText, itemsText);
    if (result.error) {
      set({ formError: result.error });
      return;
    }

    set({ value: { capacity: result.capacity, items: result.items }, formError: "" });
    postSequence(RESOURCE_PATH, { capacity: result.capacity, items: result.items })
      .catch(() => set({ status: "offline" }));
  },
}));
