## Spec: Task 4 — narrate the DP backtrace step by step

### Problem
Part (b) of Task 4 currently just prints the final answer ("Items 1, 3, 4 — size 9, value
10") with no visible reasoning, and the green table highlight is unexplained — it actually
marks every cell visited while walking the backtrace, not just the cells where an item was
taken, which reads as ambiguous. The student needs to see *how* the answer was derived from
the table, the same way Heap Sort/Quick Sort already narrate their steps.

### Out of scope
- Changing the backtrace *algorithm* — `backtrace()`'s logic (compare `DP[i][c]` vs
  `DP[i-1][c]`, descend) is already correct; this only exposes its steps for display.
- Animating the walk (no step-through/playback controls) — same static step-list pattern
  used elsewhere on the site (Heap Sort's sift-down list, Quick Sort's partition log).
- Backend/API changes — this is pure frontend derivation from data already in the store.

### Solution
- Extend `backtrace()` in `frontend/src/lib/knapsack.js` to also return `steps`: one entry
  per `i` from `n` down to `1`, recording `{i, cBefore, cAfter, taken, dpWith, dpWithout}` —
  the exact comparison made at that step.
- `KnapsackSection.jsx` renders `steps` as a numbered list under part (b), one line per step:
  "i=6, c=9: DP[6][9]=29 vs DP[5][9]=29 → equal → item 6 not taken → move to i=5, c=9" (taken
  case shows the capacity reduction instead).
- Clarify the green-cell caption to say what it actually shows: every `(i, c)` visited while
  tracing back from `DP[n][b]` to `DP[0][...]` — not only the cells where an item was taken.
- No new input, no new store — `steps` is derived from the same `table`/`items`/`capacity`
  already in `KnapsackSection`'s props, so it re-renders automatically on every new submitted
  sequence, exactly like the rest of Task 4.

### Service interactions
None — pure frontend, no network/API involved.

### API / Interface changes
None.

### Data model
`backtrace()`'s new return shape (in-memory only, nothing persisted):
```js
{
  chosenItems: [3, 5],
  optimalValue: 29,
  steps: [
    { i: 6, cBefore: 9, cAfter: 9, taken: false, dpWith: 29, dpWithout: 29 },
    { i: 5, cBefore: 9, cAfter: 2, taken: true,  dpWith: 29, dpWithout: 5 },
    { i: 4, cBefore: 2, cAfter: 2, taken: false, dpWith: 5,  dpWithout: 5 },
    // ... down to i = 1
  ]
}
```

### Failure modes

| Failure | Detected by | Handling |
|---|---|---|
| `items` empty or `capacity` 0 (degenerate input) | `steps` loop naturally produces zero/short list | Render "no items to trace" instead of an empty list |
| Existing callers of `backtrace()` (just destructure `chosenItems`/`optimalValue`) | none — `steps` is an additive field | No breakage; nothing needs updating beyond `KnapsackSection.jsx` |

### Test plan
- [ ] Happy path: `steps` for the conspect's example reproduces the exact i/c sequence used
  to find items 3 and 5 (cross-check against the manually-traced path)
- [ ] Happy path: re-submitting a different capacity/items set produces a `steps` list whose
  final state matches the new `chosenItems`
- [ ] Edge case: single item that doesn't fit (`size > capacity`) → one step, `taken: false`
- [ ] Edge case: every item taken (capacity large enough for all) → `steps` shows `taken: true` at every row
- [ ] Regression: existing `knapsack.test.js` assertions on `chosenItems`/`optimalValue` still pass unchanged
