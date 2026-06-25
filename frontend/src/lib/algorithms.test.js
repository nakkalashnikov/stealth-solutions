import { describe, it, expect } from "vitest";
import { heapSortTrace, quickSortTrace, validateSequence, MAX_N } from "./algorithms.js";

const TASK1_ARRAY = [12, 3, 5, 43, 16, 15, 17, 0, 1, 5, 0, 89, 23];
const EXPECTED_SORTED = [0, 0, 1, 3, 5, 5, 12, 15, 16, 17, 23, 43, 89];

describe("heapSortTrace", () => {
  it("happy path: sorts the conspect array correctly", () => {
    const events = heapSortTrace(TASK1_ARRAY);
    expect(events[events.length - 1].snapshot).toEqual(EXPECTED_SORTED);
  });

  it("builds the expected max-heap before extraction", () => {
    const events = heapSortTrace(TASK1_ARRAY);
    const heapBuilt = events.find((e) => e.type === "heap_built");
    expect(heapBuilt.snapshot).toEqual([89, 43, 23, 3, 16, 15, 17, 0, 1, 5, 0, 12, 5]);
  });
});

describe("quickSortTrace", () => {
  it("happy path: sorts the conspect array correctly (Hoare, pivot = middle)", () => {
    const events = quickSortTrace(TASK1_ARRAY);
    expect(events[events.length - 1].snapshot).toEqual(EXPECTED_SORTED);
  });

  it("first partition splits at the index found in the conspect", () => {
    const events = quickSortTrace(TASK1_ARRAY);
    const firstDone = events.find((e) => e.type === "partition_done");
    expect(firstDone.split).toBe(8);
  });
});

describe("validateSequence", () => {
  it("failure: rejects an empty array", () => {
    expect(validateSequence([])).not.toBeNull();
  });

  it(`failure: rejects more than ${MAX_N} numbers`, () => {
    expect(validateSequence(Array(MAX_N + 1).fill(1))).not.toBeNull();
  });

  it("happy path: accepts a normal sequence", () => {
    expect(validateSequence([1, 2, 3])).toBeNull();
  });
});
