import { test } from "node:test";
import assert from "node:assert/strict";
import { KnapsackInput } from "./knapsackInput.js";
import { InvalidSequenceError } from "./sequence.js";

test("happy path: valid input is accepted and round-trips via toJSON", () => {
  const input = new KnapsackInput({ capacity: 9, items: [{ size: 6, value: 3 }, { size: 2, value: 2 }] });
  assert.deepEqual(input.toJSON(), { capacity: 9, items: [{ size: 6, value: 3 }, { size: 2, value: 2 }] });
});

test("failure: rejects non-positive capacity", () => {
  assert.throws(() => new KnapsackInput({ capacity: 0, items: [{ size: 1, value: 1 }] }), InvalidSequenceError);
});

test("failure: rejects empty items", () => {
  assert.throws(() => new KnapsackInput({ capacity: 9, items: [] }), InvalidSequenceError);
});

test("failure: rejects more than 12 items", () => {
  const items = Array.from({ length: 13 }, () => ({ size: 1, value: 1 }));
  assert.throws(() => new KnapsackInput({ capacity: 9, items }), InvalidSequenceError);
});

test("failure: rejects an item with a non-positive size", () => {
  assert.throws(() => new KnapsackInput({ capacity: 9, items: [{ size: 0, value: 1 }] }), InvalidSequenceError);
});
