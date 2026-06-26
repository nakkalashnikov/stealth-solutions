## Spec: Task 5 — Complexity classes diagram + NP-completeness proof

### Problem
Part 1 asks for the P/NP/NP-complete/NP-hard schema (already answered by the student's hand
drawing) with an example problem per class. Part 2 asks for a full NP-completeness proof of
the single-machine scheduling feasibility problem `1|r_j,d_j|-`. Neither part has a numeric
input to drive an interactive generator (like Task 1/2/4) or even a "method to apply to your
own data" framing (like Task 3) — this is two fixed pieces of theory that need to be written
out clearly and correctly. It's static content, same pattern as Task 3.

### Out of scope
- Any interactive input — there's nothing here that varies per "instance" the way a sort
  array or a knapsack does. (Part 2's reduction is from PARTITION for *this specific*
  scheduling problem; it's not a generic "prove NP-completeness of X" tool.)
- Re-deriving or second-guessing the hand-drawn diagram's content — it's mathematically
  standard (P ⊊ NP ⊊ ∅ under P≠NP assumption, NP-hard ⊇ NP-complete = NP ∩ NP-hard, with
  strongly-NP-complete as a refinement inside NP-complete). The component renders this
  standard schema, not a transcription of the photo's exact pixel layout.
- Covering every textbook example problem — one or two clear examples per class are enough.

### Solution
- New static component `ComplexityClassesSection.jsx` (same non-interactive pattern as
  `GraphGuideSection.jsx`) — Task 5 gets a plain `<section id="task5">`, no form.
- A small presentational `ComplexityVennDiagram.jsx`: inline SVG, two overlapping ellipses
  (NP, NP-hard) with a small P circle nested inside NP, the overlap region labeled NPC, and
  an NPC/SNPC dividing line inside the overlap — mirrors the hand-drawn diagram's structure
  without trying to pixel-match it. One example problem is captioned per region (P, NP,
  NPC, NP-hard-only).
- Part 2 is written out as a standard two-part NP-completeness proof:
  1. **Membership in NP** — a candidate schedule is a poly-size certificate, verifiable in
     polynomial time (check each job's start ≥ r_j, finish ≤ d_j, no two jobs overlap).
  2. **NP-hardness** — polynomial reduction from PARTITION: given integers summing to 2B,
     build n+1 jobs (one per integer, wide window `[0, 2B+1]`, plus one "blocking" job of
     length 1 with a tight window `[B, B+1]`), and show total processing time equals the
     horizon length, so a feasible schedule exists iff some subset of the integers sums to
     exactly B.
- No new lib/store/backend code — this is prose + one diagram component, nothing computed
  from user input.

### Service interactions
None — pure static frontend content, no network/API involved.

### API / Interface changes
None.

### Data model
None — no persisted or computed data; the diagram and proof are fixed JSX content.

### Failure modes

| Failure | Detected by | Handling |
|---|---|---|
| Diagram becomes unreadable on narrow (watch-sized) viewports | Same `clamp()`/breakpoint pattern already used sitewide | SVG scales via `viewBox` + `max-width: 100%`, same as `HeapTree`/`BinaryTree` |
| Proof reasoning has a subtle error (e.g. off-by-one on B vs B+1 windows) | Manual re-derivation before writing the final JSX | Verify the construction's arithmetic explicitly (total processing = 2B+1 = horizon length) before publishing, not just asserting it |

### Test plan
- [ ] Happy path: page renders Task 5 with no console errors, diagram visible, both parts present
- [ ] Edge case: narrow viewport (≤280px) — diagram and proof text remain legible (existing CSS breakpoint)
- [ ] Regression: existing test suites (backend, frontend) unaffected — no logic changed, only new static content
