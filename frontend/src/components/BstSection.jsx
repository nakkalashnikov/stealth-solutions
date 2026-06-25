import { insertTrace, traversals, buildBalancedBst, deleteRootTrace } from "../lib/bst.js";
import BinaryTree from "./BinaryTree.jsx";

const CASE_LABEL = {
  "no-child": "the root has no children — it's just removed",
  "one-child": "the root has exactly one child — that child takes its place",
  "two-children": "the root has two children — replace it with the minimum value from its right subtree, then remove that minimum from the right subtree",
};

export default function BstSection({ sequence }) {
  const { root, steps } = insertTrace(sequence);
  const { preOrder, inOrder, postOrder } = traversals(root);
  const sorted = [...new Set(sequence)].sort((a, b) => a - b);
  const balancedRoot = buildBalancedBst(sorted);
  const { newRoot: afterDeleteRoot, caseUsed, removedValue } = deleteRootTrace(root);

  const skipped = steps.filter((s) => !s.inserted);

  return (
    <div>
      <h4>a) Build the BST by inserting elements one by one</h4>
      <p>Each value is inserted starting from the root: go left if it's smaller than the
        current node, right if it's larger, until an empty spot is found. Insertion
        <em> order</em> determines the shape — unlike Task 1's array, reordering this
        sequence would produce a different tree.</p>

      <BinaryTree root={root} highlightValues={new Set(sequence.slice(-1))}
                  caption={`Final BST after inserting all ${sequence.length} values`} />

      {skipped.length > 0 && (
        <p className="note">Skipped duplicate value{skipped.length > 1 ? "s" : ""}:{" "}
          {skipped.map((s) => s.value).join(", ")} — already present, a BST has no second
          place for an equal key.</p>
      )}

      <h4>b) Traversals</h4>
      <p><strong>Pre-order</strong> (root → left → right):</p>
      <div className="answer-box">[{preOrder.join(", ")}]</div>
      <p><strong>In-order</strong> (left → root → right) — always sorted for a valid BST:</p>
      <div className="answer-box">[{inOrder.join(", ")}]</div>
      <p><strong>Post-order</strong> (left → right → root):</p>
      <div className="answer-box">[{postOrder.join(", ")}]</div>

      <h4>c) Balanced BST (BBST)</h4>
      <p>Sort the values, then recursively pick the <em>middle</em> element as the root of
        each subtree — same "pick the middle" convention as Quick Sort's pivot. This gives
        the shortest possible tree height for this set of values.</p>
      <BinaryTree root={balancedRoot} caption={`Balanced BST — height ${Math.ceil(Math.log2(sorted.length + 1))}`} />

      <h4>d) Deleting the root</h4>
      <ol className="steps">
        <li><strong>No children:</strong> {CASE_LABEL["no-child"]}.</li>
        <li><strong>One child:</strong> {CASE_LABEL["one-child"]}.</li>
        <li><strong>Two children:</strong> {CASE_LABEL["two-children"]}.</li>
      </ol>

      {caseUsed && (
        <>
          <p>For this tree, the root ({root.value}) has two children, so{" "}
            <strong>case 3</strong> applies: the minimum of the right subtree is{" "}
            <strong>{removedValue}</strong> — it replaces the root, then gets removed from
            where it used to be.</p>
          <BinaryTree root={afterDeleteRoot} highlightValues={new Set([removedValue])}
                      caption={`Tree after deleting the root (${root.value} → replaced by ${removedValue})`} />
        </>
      )}
    </div>
  );
}
