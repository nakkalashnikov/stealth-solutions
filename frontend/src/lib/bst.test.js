import { describe, it, expect } from "vitest";
import { insertTrace, traversals, buildBalancedBst, deleteRootTrace } from "./bst.js";

const CONSPECT_SEQUENCE = [19, 3, 31, 1, 27, 17, 21, 16, 18, 15, 22, 37, 25, 11, 26, 2, 98];

describe("insertTrace + traversals", () => {
  it("happy path: standard BST insert produces a fully sorted in-order traversal", () => {
    const { root } = insertTrace(CONSPECT_SEQUENCE);
    const { preOrder, inOrder, postOrder } = traversals(root);

    // in-order must equal the sorted input for any valid BST — the strongest
    // possible correctness check, independent of any particular tree shape
    expect(inOrder).toEqual([...CONSPECT_SEQUENCE].sort((a, b) => a - b));
    expect(preOrder).toEqual([19, 3, 1, 2, 17, 16, 15, 11, 18, 31, 27, 21, 22, 25, 26, 37, 98]);
    expect(postOrder).toEqual([2, 1, 11, 15, 16, 18, 17, 3, 26, 25, 22, 21, 27, 98, 37, 31, 19]);
  });

  it("edge case: duplicate values are skipped, not inserted twice", () => {
    const { root, steps } = insertTrace([5, 3, 3, 8]);
    expect(traversals(root).inOrder).toEqual([3, 5, 8]);
    expect(steps.filter((s) => !s.inserted)).toHaveLength(1);
  });
});

describe("buildBalancedBst", () => {
  it("happy path: in-order of the rebuilt tree equals the sorted input (still a valid BST)", () => {
    const sorted = [...CONSPECT_SEQUENCE].sort((a, b) => a - b);
    const balanced = buildBalancedBst(sorted);
    expect(traversals(balanced).inOrder).toEqual(sorted);
  });
});

describe("deleteRootTrace", () => {
  it("happy path: two-children root is replaced by the min of the right subtree (conspect example)", () => {
    const { root } = insertTrace(CONSPECT_SEQUENCE);
    const { newRoot, caseUsed, removedValue } = deleteRootTrace(root);
    expect(caseUsed).toBe("two-children");
    expect(removedValue).toBe(21); // min of the right subtree, matches the handwritten example
    expect(newRoot.value).toBe(21);
    expect(traversals(newRoot).inOrder).toEqual([1, 2, 3, 11, 15, 16, 17, 18, 21, 22, 25, 26, 27, 31, 37, 98]);
  });

  it("failure/edge case: deleting the root of a single-node tree returns an empty tree", () => {
    const { root } = insertTrace([42]);
    const { newRoot, caseUsed } = deleteRootTrace(root);
    expect(caseUsed).toBe("no-child");
    expect(newRoot).toBeNull();
  });

  it("edge case: root with only one child is replaced by that child", () => {
    const { root } = insertTrace([5, 3, 1]); // 5 -> left 3 -> left 1, no right children anywhere
    const { newRoot, caseUsed } = deleteRootTrace(root);
    expect(caseUsed).toBe("one-child");
    expect(newRoot.value).toBe(3);
  });

  it("does not mutate the original tree (callers render both before/after side by side)", () => {
    const { root } = insertTrace(CONSPECT_SEQUENCE);
    const before = JSON.stringify(traversals(root).inOrder);
    deleteRootTrace(root);
    expect(JSON.stringify(traversals(root).inOrder)).toBe(before);
  });
});
