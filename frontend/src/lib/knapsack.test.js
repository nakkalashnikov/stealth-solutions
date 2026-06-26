import { describe, it, expect } from "vitest";
import { knapsackDP, backtrace, fractionalKnapsack } from "./knapsack.js";

const CONSPECT_ITEMS = [
  { size: 6, value: 3 },
  { size: 2, value: 2 },
  { size: 2, value: 5 },
  { size: 1, value: 2 },
  { size: 7, value: 24 },
  { size: 12, value: 44 },
];
const CAPACITY = 9;

describe("knapsackDP + backtrace", () => {
  it("happy path: matches the conspect's optimal value and chosen items (b=9)", () => {
    const table = knapsackDP(CONSPECT_ITEMS, CAPACITY);
    const { chosenItems, optimalValue } = backtrace(table, CONSPECT_ITEMS, CAPACITY);

    expect(optimalValue).toBe(29);
    expect(chosenItems).toEqual([3, 5]); // 1-indexed: items 3 and 5, matching the conspect
  });

  it("happy path: DP[4][5] matches the conspect's part (d) sub-query", () => {
    const table = knapsackDP(CONSPECT_ITEMS, CAPACITY);
    expect(table[4][5]).toBe(9);
  });

  it("edge case: capacity smaller than every item's size selects nothing", () => {
    const table = knapsackDP([{ size: 5, value: 100 }], 2);
    const { chosenItems, optimalValue } = backtrace(table, [{ size: 5, value: 100 }], 2);
    expect(chosenItems).toEqual([]);
    expect(optimalValue).toBe(0);
  });

  it("happy path: steps narrate exactly which items were taken/skipped, in i-descending order", () => {
    const table = knapsackDP(CONSPECT_ITEMS, CAPACITY);
    const { steps } = backtrace(table, CONSPECT_ITEMS, CAPACITY);

    expect(steps.map((s) => s.i)).toEqual([6, 5, 4, 3, 2, 1]);
    expect(steps.filter((s) => s.taken).map((s) => s.i)).toEqual([5, 3]); // reported in i-desc order, chosenItems is the reverse

    // capacity only drops on a "taken" step, by exactly that item's size
    const step5 = steps.find((s) => s.i === 5);
    expect(step5.taken).toBe(true);
    expect(step5.cAfter).toBe(step5.cBefore - CONSPECT_ITEMS[4].size);

    const step6 = steps.find((s) => s.i === 6);
    expect(step6.taken).toBe(false);
    expect(step6.cAfter).toBe(step6.cBefore);
  });

  it("edge case: a single non-fitting item produces one 'not taken' step", () => {
    const items = [{ size: 5, value: 100 }];
    const table = knapsackDP(items, 2);
    const { steps } = backtrace(table, items, 2);

    expect(steps).toEqual([{ i: 1, cBefore: 2, cAfter: 2, taken: false, dpWith: 0, dpWithout: 0 }]);
  });
});

describe("fractionalKnapsack", () => {
  it("happy path: matches the conspect's ratio ordering and greedy result", () => {
    const { ranked, totalValue } = fractionalKnapsack(CONSPECT_ITEMS, CAPACITY);
    expect(ranked.map((r) => r.index)).toEqual([6, 5, 3, 4, 2, 1]);
    expect(totalValue).toBeCloseTo(33, 5); // item 6 taken fractionally (9/12), value 44*0.75=33
  });

  it("failure/edge case: zero remaining capacity takes nothing further", () => {
    const { steps } = fractionalKnapsack([{ size: 1, value: 1 }, { size: 1, value: 1 }], 1);
    expect(steps[1].takenValue).toBe(0);
  });
});
