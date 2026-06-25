import { describe, it, expect } from "vitest";
import { parseKnapsackInput, formatKnapsackInput } from "./knapsackStore.js";

describe("parseKnapsackInput", () => {
  it("happy path: parses capacity and size:value pairs", () => {
    const result = parseKnapsackInput("9", "6:3, 2:2, 2:5");
    expect(result.error).toBeUndefined();
    expect(result.capacity).toBe(9);
    expect(result.items).toEqual([{ size: 6, value: 3 }, { size: 2, value: 2 }, { size: 2, value: 5 }]);
  });

  it("failure: rejects a non-positive capacity", () => {
    expect(parseKnapsackInput("0", "1:1").error).toBeTruthy();
  });

  it("failure: rejects a malformed pair", () => {
    expect(parseKnapsackInput("9", "6:3, oops").error).toBeTruthy();
  });

  it("failure: rejects too many items", () => {
    const itemsText = Array.from({ length: 13 }, () => "1:1").join(", ");
    expect(parseKnapsackInput("9", itemsText).error).toBeTruthy();
  });
});

describe("formatKnapsackInput", () => {
  it("round-trips through parseKnapsackInput", () => {
    const original = { capacity: 9, items: [{ size: 6, value: 3 }, { size: 2, value: 2 }] };
    const { capacityText, itemsText } = formatKnapsackInput(original);
    const parsed = parseKnapsackInput(capacityText, itemsText);
    expect(parsed).toEqual(original);
  });
});
