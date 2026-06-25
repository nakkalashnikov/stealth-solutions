## Spec: React frontend + real backend for shared sequence sync

### Problem
The site is currently a single static page (vanilla HTML/CSS/JS) with no real backend — the
"sync" code added earlier polls `/api/sequence`, but that endpoint doesn't exist anywhere, so
a sequence typed on one device (e.g. a watch) never reaches another device (e.g. a phone).
Classmates need to see the same input sequence and resulting Heap Sort / Quick Sort
visualization regardless of which device opened the page. The codebase also needs to move
off string-concatenated HTML (`innerHTML` building) to something maintainable as the project
grows — React.

### Out of scope
- User accounts / auth — anyone with the link can submit a sequence (matches current trust
  model: classmates, no hostile editing expected).
- Edit history / undo / multiple concurrent "rooms" — there is exactly one shared sequence.
- Hosting/infra provisioning — a separate concern (deploy target not yet decided).
- Native watch apps — the watch still just opens the page in its limited web view, same as today.
- Algorithm changes — `heapSortTrace` / `quickSortTrace` / Hoare-partition logic are ported as-is.

### Solution
- Split repo into `frontend/` (React + Vite) and `backend/` (Node + Express) — both still
  deployed as one site, frontend built to static files served by the backend (or any static
  host pointed at the same API origin).
- Port the existing pure functions (`heapSortTrace`, `quickSortTrace`, `drawHeapSVG`,
  `renderArrayRow`, complexity text) unchanged into a `lib/algorithms.js` module, imported by
  React components instead of returning HTML strings — components render trees/arrays as JSX.
- Backend exposes a tiny REST API backed by a single SQLite row (no need for a full DB server
  for one shared value); add an SSE stream so updates push instantly instead of 4s polling.
- Frontend subscribes to the SSE stream on mount; submitting the form POSTs and updates
  optimistically, same UX as today.
- Dark theme, watch-width responsiveness, and the existing CSS breakpoints carry over unchanged.

### Service interactions

| From | To | Protocol | Trigger |
|---|---|---|---|
| React app | Express API | HTTPS GET | page load (fetch current sequence) |
| React app | Express API | HTTPS POST | user submits a new sequence |
| React app | Express API | SSE (HTTPS, long-lived) | subscribes on mount, receives push on any update |
| Express API | SQLite | local file I/O | every GET/POST |

### API / Interface changes

**New or changed endpoints:**
| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| GET | `/api/sequence` | none | — | `{ sequence: number[], updatedAt: string }` |
| POST | `/api/sequence` | none | `{ sequence: number[] }` | `{ sequence: number[], updatedAt: string }` |
| GET | `/api/sequence/stream` | none | — | SSE stream, `event: update`, `data: {sequence, updatedAt}` on every change |

**New RabbitMQ events:** none — single-process backend, in-memory event emitter feeds the SSE stream directly.

**New or changed DB fields:**
| Table | Field | Type | Notes |
|---|---|---|---|
| `sequence_state` | `id` | INTEGER PK | always `1` — single-row table |
| `sequence_state` | `sequence` | TEXT (JSON array) | e.g. `"[12,3,5,43]"` |
| `sequence_state` | `updated_at` | TEXT (ISO 8601) | for display ("last updated by classmate at ...") |

### Data model
```json
{
  "sequence": [12, 3, 5, 43, 16, 15, 17, 0, 1, 5, 0, 89, 23],
  "updatedAt": "2026-06-26T10:42:00Z"
}
```

### Failure modes

| Failure | Detected by | Handling |
|---|---|---|
| POST body not a valid number array | Express validation (length 2–31, all finite numbers) | 400 response with error message; frontend shows the same inline error it shows today |
| Backend unreachable (down/offline) | `fetch`/`EventSource` error/timeout | Frontend falls back to its last-rendered local state, shows a small "offline — not synced" badge, keeps working locally |
| Two people submit within the same second | Last write wins (single SQLite row, no merge) | Acceptable per current trust model; no lock needed |
| SSE connection drops (mobile network switch, watch sleep) | `EventSource.onerror` | Auto-reconnect (browser default behavior) + one-shot GET on reconnect to catch up instantly |
| `MAX_N` (31) exceeded or <2 numbers | Same validation, both client and server | Reject before reaching the DB; existing client-side message reused |

### Test plan
- [ ] Happy path: submit a sequence on device A, confirm device B's open tab updates within ~1s via SSE without manual refresh
- [ ] Happy path: page loads with no prior state → shows last DB value, not the hardcoded default
- [ ] Failure: POST with non-numeric / empty / 40-element array → 400, frontend shows existing inline error, DB unchanged
- [ ] Failure: backend killed mid-session → frontend keeps rendering last known sequence, shows offline indicator, recovers automatically when backend returns
- [ ] Edge case: two tabs submit different sequences within 1s → both clients converge to whichever write landed last in SQLite
- [ ] Edge case: watch browser (no EventSource support, if applicable) → falls back to polling GET every 4s instead of crashing
- [ ] Regression: Heap Sort / Quick Sort visual output for the default array is byte-identical to the current vanilla-JS output (ported logic, not rewritten)
