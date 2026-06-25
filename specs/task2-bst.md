## Spec: Task 2 — BST build / traversals / BBST / root deletion

### Problem
The conspect has a second, distinct exercise: given a sequence, (a) build a BST by inserting
elements one at a time (tree shape depends on insertion *order*, unlike Task 1's sort-an-array
problems), (b) print pre/in/post-order traversals, (c) rebuild it as a balanced BST (BBST)
from the sorted values, (d) explain + demonstrate deleting the root. It needs to live on the
same page as Task 1, with its own input field — the two tasks must not share state, since a
BST's shape depends on insertion order while Task 1's array doesn't care about order.

### Out of scope
- Self-balancing on insert (AVL/Red-Black rotations) — the BBST here is the conspect's
  approach: rebuild from the sorted array by repeatedly picking the middle element, not an
  online-rebalancing insert.
- Deleting an arbitrary node — only root deletion (per the conspect's part d), using the
  standard 3-case rule (no child / one child / two children → replace with min of right
  subtree, then remove that min from the right subtree).
- Duplicate values in the input sequence — skip a value on insert if it already exists in the
  tree (documented behavior, avoids ambiguous BST shape); not a concern for the conspect's
  example (all 17 values are distinct).
- Visual diffing/animation between insertion steps — same static-step-list pattern as Task 1.

### Solution
- Mirror Task 1's architecture exactly, as a second independent resource — not a variant of
  the existing `sequence` store/endpoint, since the two inputs have different semantics
  (insertion order matters for BST, not for sort) and must fail independently.
- `frontend/src/lib/bst.js`: pure functions — `insertTrace(values)` (step-by-step BST build,
  skipping duplicates), `traversals(root)` (pre/in/post-order arrays), `buildBalancedBst(sortedValues)`
  (recursive middle-split), `deleteRootTrace(root)` (3-case logic + the worked example).
- `frontend/src/lib/binaryTreeGeometry.js`: generic binary-tree layout (x from in-order
  position, y from depth) — Task 1's `heapGeometry.js` can't be reused since it assumes the
  implicit array-index shape of a heap, not an arbitrary left/right-pointer tree.
- New components `BinaryTree.jsx` (generic renderer, same SVG look as `HeapTree.jsx`) and
  `BstSection.jsx` (orchestrates a–d, same pattern as `HeapSortSection.jsx`).
- Backend: duplicate the `sequence` resource (domain/usecase/infra/presentation) as
  `bstSequence`, exposed at `/api/bst-sequence` (+ `/stream`), its own SQLite table — same
  isolation as Task 1 so a Task 2 bug can't corrupt Task 1's shared state.
- `App.jsx` gets a second `<section id="task2">` with its own form, same page, same dark theme.

### Service interactions

| From | To | Protocol | Trigger |
|---|---|---|---|
| React app (Task 2 form) | Express API | HTTPS GET/POST | page load / submit, same pattern as Task 1 |
| React app | Express API | SSE | subscribes to `/api/bst-sequence/stream` on mount |
| Express API | SQLite | local file I/O | second table in the same `sequence.sqlite` file |

### API / Interface changes

**New or changed endpoints:**
| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| GET | `/api/bst-sequence` | none | — | `{ sequence: number[], updatedAt: string }` |
| POST | `/api/bst-sequence` | none | `{ sequence: number[] }` | `{ sequence: number[], updatedAt: string }` |
| GET | `/api/bst-sequence/stream` | none | — | SSE, same shape as Task 1's stream |

**New RabbitMQ events:** none

**New or changed DB fields:**
| Table | Field | Type | Notes |
|---|---|---|---|
| `bst_sequence_state` | `id` | INTEGER PK | always `1`, separate table from Task 1's `sequence_state` |
| `bst_sequence_state` | `sequence` | TEXT (JSON array) | insertion order preserved — e.g. `"[19,3,31,1,...]"` |
| `bst_sequence_state` | `updated_at` | TEXT (ISO 8601) | |

### Data model
```json
{ "sequence": [19, 3, 31, 1, 27, 17, 21, 16, 18, 15, 22, 37, 25, 11, 26, 2, 98], "updatedAt": "2026-06-26T10:00:00Z" }
```
In-memory BST node shape (not persisted — rebuilt from `sequence` on every render):
```js
{ value: 19, left: { value: 3, left: ..., right: ... }, right: { value: 31, ... } }
```

### Failure modes

| Failure | Detected by | Handling |
|---|---|---|
| Duplicate value in input sequence | `insertTrace` checks existing values before insert | Skip the insert, note it in the step list ("19 already in the tree — skipped") instead of erroring |
| Sequence too short to demonstrate root deletion meaningfully (root has 0–1 children) | `deleteRootTrace` branches on child count | Still show the correct (simpler) case — no error, just a shorter explanation |
| Same general input validation as Task 1 (length 2–31, finite numbers) | shared `validateSequence` from `lib/algorithms.js` | Same inline error message, reused as-is |
| Backend down / bst-sequence endpoint unreachable | `fetch`/`EventSource` error | Same offline badge behavior as Task 1, independent per task (Task 1 can stay synced while Task 2 is offline, or vice versa) |
| Two people submit Task 2 sequences within the same second | last write wins, same as Task 1 | Acceptable, same trust model |

### Test plan
- [ ] Happy path: insert the conspect's 17-value sequence → resulting pre/in/post-order arrays match the conspect exactly
- [ ] Happy path: `buildBalancedBst` on the sorted 17 values produces a valid BST (in-order traversal equals the sorted input) with height ⌊log₂17⌋+1
- [ ] Happy path: `deleteRootTrace` on the part-a tree replaces root 19 with 21 (min of right subtree) and removes the original 21 node, matching the conspect's worked example
- [ ] Failure: input sequence with a duplicate value → duplicate is skipped, no crash, step list notes it
- [ ] Edge case: single-element or two-element sequence → traversals all equal, deletion handles 0/1-child root correctly
- [ ] Edge case: Task 1 and Task 2 forms operate independently — submitting one does not affect the other's stored sequence or SSE stream
- [ ] Regression: existing Task 1 tests (backend `sequence.test.js`, frontend `algorithms.test.js`) still pass unchanged
