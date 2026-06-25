## Spec: Task 4 — 0/1 Knapsack (DP) + Fractional Knapsack (greedy)

### Problem
The conspect's 4th exercise (0/1 Knapsack via DP table + backtrace, and Fractional Knapsack
via greedy ratio-sort) is, unlike Task 3's graph, pure numeric input — capacity `b` plus a
list of `(size, value)` items — so it fits the same interactive generator pattern as Task 1/2
instead of becoming a static guide like Task 3. Part (d) of the conspect ("optimal value for
b=5 and only 4 first elements") is really just reading an already-computed cell out of the
same DP table, which is worth surfacing explicitly since it's the core insight of DP.

### Out of scope
- Knapsack variants beyond 0/1 and fractional (no bounded/unbounded knapsack).
- General multi-field input UI components — reuses free-text parsing like Task 1/2's
  comma-separated format, just with a `size:value` pair syntax instead of bare numbers.
- Reusing `createSequenceStore`/`validateSequence` as-is — the input shape
  (`{capacity, items}`) isn't a flat number array, so this resource gets its own small
  store/validation, following the same pattern rather than forcing a shared abstraction.

### Solution
- New resource `knapsack`, same isolation pattern as `sequence`/`bst-sequence`: own SQLite
  table, own `/api/knapsack` (+ `/stream`) endpoint, own SSE subscription.
- Backend: add `KnapsackInput` domain class (validates `capacity` and `items[]`); generalize
  `makeUpdateSequence` with an optional `DomainClass` param (defaults to `Sequence`) instead
  of duplicating the use-case — the repository/router are already shape-agnostic (they just
  persist/emit whatever JSON the domain class's `toJSON()` returns).
- `frontend/src/lib/knapsack.js`: pure functions — `knapsackDP(items, capacity)` (builds the
  full `DP[i][c]` table per the conspect's recurrence), `backtrace(table, items, capacity)`
  (walks the table to find which items are chosen), `fractionalKnapsack(items, capacity)`
  (sort by `value/size` ratio, greedily fill, fractional last item if needed).
- `KnapsackForm.jsx` (capacity field + `size:value, size:value, ...` items field) and
  `KnapsackSection.jsx`: renders the recurrence (static text), the full DP table with the
  backtrace path highlighted, a small "look up `DP[n][b]`" control (two number inputs,
  defaulting to the conspect's `n=4, b=5`) that just reads a cell from the already-rendered
  table, and the Fractional Knapsack ratio/greedy walkthrough.
- Complexity note (static text): `O(n·b)` for DP, `O(n log n)` for fractional (dominated by
  the sort).

### Service interactions

| From | To | Protocol | Trigger |
|---|---|---|---|
| React app (Task 4 form) | Express API | HTTPS GET/POST | page load / submit, same pattern as Task 1/2 |
| React app | Express API | SSE | subscribes to `/api/knapsack/stream` on mount |
| Express API | SQLite | local file I/O | third table (`knapsack_state`) in the same `sequence.sqlite` file |

### API / Interface changes

**New or changed endpoints:**
| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| GET | `/api/knapsack` | none | — | `{ sequence: {capacity: number, items: [{size, value}]}, updatedAt: string }` |
| POST | `/api/knapsack` | none | `{ sequence: {capacity, items} }` | same shape echoed back |
| GET | `/api/knapsack/stream` | none | — | SSE, same envelope as Task 1/2's stream |

(Wire envelope keeps the existing generic `{ sequence: <value> }` field name from
`sequenceService.js`/`sequenceRouter.js` — `<value>` is just a different JSON shape here, no
router changes needed.)

**New RabbitMQ events:** none

**New or changed DB fields:**
| Table | Field | Type | Notes |
|---|---|---|---|
| `knapsack_state` | `id` | INTEGER PK | always `1`, isolated from Task 1/2's tables |
| `knapsack_state` | `sequence` | TEXT (JSON) | `{"capacity":9,"items":[{"size":6,"value":3},...]}` |
| `knapsack_state` | `updated_at` | TEXT (ISO 8601) | |

### Data model
```json
{
  "capacity": 9,
  "items": [
    { "size": 6, "value": 3 },
    { "size": 2, "value": 2 },
    { "size": 2, "value": 5 },
    { "size": 1, "value": 2 },
    { "size": 7, "value": 24 },
    { "size": 12, "value": 44 }
  ]
}
```

### Failure modes

| Failure | Detected by | Handling |
|---|---|---|
| Capacity not a positive finite number | `KnapsackInput` constructor | 400, "capacity must be a positive number" |
| Items array empty or >12 (table-readability cap, like `MAX_N` elsewhere) | `KnapsackInput` constructor | 400, "between 1 and 12 items" |
| An item's size/value not a positive finite number | `KnapsackInput` constructor | 400, names the bad item's index |
| Sub-query lookup (n, b) outside the rendered table's bounds | UI bounds the number inputs to `[0, items.length]` / `[0, capacity]` | Inputs clamp, can't request an out-of-range cell |
| Backend down | `fetch`/`EventSource` error | Same offline badge as Task 1/2, independent per resource |
| Capacity large enough to make the table impractically wide (e.g. 500) | No hard cap beyond "positive number" in the domain — practical cap enforced softly | Document a recommended `b ≤ 40`-ish in the UI placeholder; not a hard validation rule since the conspect itself uses small values |

### Test plan
- [ ] Happy path: `knapsackDP` + `backtrace` on the conspect's exact items/capacity (`b=9`,
  the 6 items shown) reproduces the conspect's table values and the "items 3 and 5 chosen,
  value 29" result
- [ ] Happy path: the `DP[4][5]` lookup control shows `9`, matching the conspect's part (d)
- [ ] Happy path: `fractionalKnapsack` on the same items/capacity reproduces the conspect's
  ratio ordering (6, 5, 3, 4, 2, 1) and the "item 6 taken fractionally, value 33" result
- [ ] Failure: items text with a malformed pair (e.g. `"6:"`) → inline form error, same
  pattern as Task 1/2, no request sent
- [ ] Failure: POST with capacity ≤ 0 or 0 items → 400 from backend
- [ ] Edge case: single item, capacity smaller than its size → DP table all zeros, nothing
  selected, fractional knapsack takes 0
- [ ] Regression: existing Task 1/2 tests (backend `sequence.test.js`, frontend
  `algorithms.test.js`, `bst.test.js`) still pass unchanged after generalizing
  `makeUpdateSequence`
