import { test } from "node:test";
import assert from "node:assert/strict";
import { Sequence, InvalidSequenceError } from "./sequence.js";

test("happy path: valid sequence is accepted and round-trips via toJSON", () => {
  const seq = new Sequence([12, 3, 5, 43]);
  assert.deepEqual(seq.toJSON(), [12, 3, 5, 43]);
});

test("failure: rejects fewer than 2 numbers", () => {
  assert.throws(() => new Sequence([1]), InvalidSequenceError);
});

test("failure: rejects more than 31 numbers", () => {
  assert.throws(() => new Sequence(Array(32).fill(1)), InvalidSequenceError);
});

test("failure: rejects non-numeric entries", () => {
  assert.throws(() => new Sequence([1, "two", 3]), InvalidSequenceError);
});

test("failure: rejects non-array input", () => {
  assert.throws(() => new Sequence("1,2,3"), InvalidSequenceError);
});
