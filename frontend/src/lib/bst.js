// BST build (insert one-by-one), traversals, balanced-BST rebuild, and
// root-deletion demo — all pure functions over a simple {value, left, right} node shape.

function makeNode(value) {
  return { value, left: null, right: null };
}

// Inserts values one at a time, in the given order (order determines shape).
// Duplicate values are skipped — a BST has no defined place for an equal key.
export function insertTrace(values) {
  let root = null;
  const steps = [];

  for (const value of values) {
    if (containsValue(root, value)) {
      steps.push({ value, inserted: false, tree: root });
      continue;
    }
    root = insert(root, value);
    steps.push({ value, inserted: true, tree: root });
  }

  return { root, steps };
}

function containsValue(node, value) {
  if (!node) return false;
  if (value === node.value) return true;
  return value < node.value ? containsValue(node.left, value) : containsValue(node.right, value);
}

function insert(node, value) {
  if (!node) return makeNode(value);
  if (value < node.value) node.left = insert(node.left, value);
  else node.right = insert(node.right, value);
  return node;
}

export function traversals(root) {
  const pre = [], inOrder = [], post = [];

  function walk(node) {
    if (!node) return;
    pre.push(node.value);
    walk(node.left);
    inOrder.push(node.value);
    walk(node.right);
    post.push(node.value);
  }
  walk(root);

  return { preOrder: pre, inOrder, postOrder: post };
}

// Balanced BST rebuilt from sorted values by repeatedly picking the middle
// element — same convention as Quick Sort's pivot = middle element.
export function buildBalancedBst(sortedValues) {
  function build(lo, hi) {
    if (lo > hi) return null;
    const mid = Math.floor((lo + hi) / 2);
    const node = makeNode(sortedValues[mid]);
    node.left = build(lo, mid - 1);
    node.right = build(mid + 1, hi);
    return node;
  }
  return build(0, sortedValues.length - 1);
}

function cloneTree(node) {
  return node ? { value: node.value, left: cloneTree(node.left), right: cloneTree(node.right) } : null;
}

// Deletes the root using the standard 3-case rule, returns the new root plus
// a description of which case fired (for the on-page explanation). Operates
// on a clone — never mutates the tree passed in, so callers can keep
// rendering the original alongside the post-deletion result.
export function deleteRootTrace(originalRoot) {
  const root = cloneTree(originalRoot);
  if (!root) return { newRoot: null, caseUsed: null };

  if (!root.left && !root.right) {
    return { newRoot: null, caseUsed: "no-child", removedValue: root.value };
  }
  if (!root.left || !root.right) {
    const onlyChild = root.left || root.right;
    return { newRoot: onlyChild, caseUsed: "one-child", removedValue: root.value };
  }

  // two children: replace with the minimum of the right subtree, then
  // remove that minimum from the right subtree (it never has a left child,
  // so removing it is always the no-child or one-child case).
  let minHolder = root.right;
  while (minHolder.left) minHolder = minHolder.left;
  const successorValue = minHolder.value;

  root.right = removeMin(root.right);
  root.value = successorValue;

  return { newRoot: root, caseUsed: "two-children", removedValue: successorValue };
}

function removeMin(node) {
  if (!node.left) return node.right;
  node.left = removeMin(node.left);
  return node;
}
