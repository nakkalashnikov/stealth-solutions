import { InvalidSequenceError } from "./sequence.js";

export const MIN_ITEMS = 1;
export const MAX_ITEMS = 12; // keeps the rendered DP table readable, same spirit as Sequence's MAX_LENGTH

function isPositiveFiniteNumber(v) {
  return typeof v === "number" && Number.isFinite(v) && v > 0;
}

// Value object — validates on construction so an invalid {capacity, items}
// can never exist past this point.
export class KnapsackInput {
  constructor({ capacity, items } = {}) {
    if (!isPositiveFiniteNumber(capacity)) {
      throw new InvalidSequenceError("capacity must be a positive number");
    }
    if (!Array.isArray(items) || items.length < MIN_ITEMS || items.length > MAX_ITEMS) {
      throw new InvalidSequenceError(`items must have between ${MIN_ITEMS} and ${MAX_ITEMS} entries`);
    }
    items.forEach((item, i) => {
      if (!item || !isPositiveFiniteNumber(item.size) || !isPositiveFiniteNumber(item.value)) {
        throw new InvalidSequenceError(`item ${i + 1} must have a positive size and value`);
      }
    });

    this.capacity = capacity;
    this.items = items.map((item) => ({ size: item.size, value: item.value }));
  }

  toJSON() {
    return { capacity: this.capacity, items: this.items };
  }
}
