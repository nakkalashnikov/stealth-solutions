import ComplexityVennDiagram from "./ComplexityVennDiagram.jsx";

export default function ComplexityClassesSection() {
  return (
    <div>
      <h4>1. Complexity classes for decision problems (assuming P ≠ NP)</h4>
      <p><strong>P</strong> — solvable in polynomial time. <strong>NP</strong> — a "yes"
        answer can be <em>verified</em> in polynomial time given a certificate (P ⊊ NP under
        this assumption). <strong>NP-hard</strong> — at least as hard as every problem in NP
        (every NP problem reduces to it in polynomial time) — note NP-hard problems aren't
        required to be decision problems in NP themselves. <strong>NP-complete (NPC)</strong>
        {" "}= NP ∩ NP-hard — the hardest problems <em>inside</em> NP. <strong>Strongly
        NP-complete (SNPC)</strong> ⊂ NPC — stays NP-complete even when all numeric inputs are
        bounded by a polynomial in the input size (no "pseudo-polynomial" algorithm escapes it).</p>

      <ComplexityVennDiagram />

      <ul className="steps">
        <li><strong>P</strong> — e.g. sorting, shortest path (Dijkstra): solved directly in
          polynomial time.</li>
        <li><strong>NP (not known to be in P or NP-complete)</strong> — e.g. Graph
          Isomorphism: a certificate (the isomorphism) verifies in poly time, but no
          polynomial algorithm nor NP-completeness proof is known.</li>
        <li><strong>NP-complete</strong> — e.g. 3-SAT, Partition, and the scheduling problem
          proved below (<code>1|r_j,d_j|-</code>): in NP, and every NP problem reduces to it.</li>
        <li><strong>NP-hard only (not in NP)</strong> — e.g. the optimization version of TSP
          ("find the shortest tour", not just "is there a tour shorter than k?"): at least as
          hard as NP, but not itself a yes/no decision problem with a poly-time verifier.</li>
      </ul>

      <h4>2. Proving 1|r_j,d_j|- is NP-complete</h4>
      <p><strong>Problem.</strong> One machine, jobs <code>1..n</code>, job <code>j</code> has
        processing time <code>p_j</code>, release date <code>r_j</code>, deadline{" "}
        <code>d_j</code>. Decide: does a non-preemptive schedule exist where every job starts
        at or after its release date and finishes at or before its deadline?</p>

      <h5>Step 1 — the problem is in NP</h5>
      <p>Certificate: a start time <code>s_j</code> for every job (equivalently, an ordering).
        Verification, in polynomial time:</p>
      <ul className="steps">
        <li>For every job <code>j</code>: check <code>r_j ≤ s_j</code> and{" "}
          <code>s_j + p_j ≤ d_j</code>.</li>
        <li>For every pair of jobs: check their intervals <code>[s_j, s_j+p_j)</code> don't
          overlap.</li>
      </ul>
      <p>Both checks are <code>O(n²)</code> (or <code>O(n log n)</code> with sorting) —
        polynomial. So the problem is in NP.</p>

      <h5>Step 2 — NP-hardness, by reduction from PARTITION</h5>
      <p><strong>PARTITION</strong> (known NP-complete): given positive integers{" "}
        <code>a_1, ..., a_n</code> summing to <code>2B</code>, does some subset sum to exactly{" "}
        <code>B</code>?</p>

      <p><strong>Construction</strong> (polynomial time) — given a PARTITION instance, build{" "}
        <code>n + 1</code> jobs:</p>
      <pre className="diagram">{`for each i = 1..n:   job J_i:    p_i = a_i,  r_i = 0,      d_i = 2B + 1
"blocker" job:       J_(n+1):   p = 1,      r = B,        d = B + 1`}</pre>

      <p>Total processing time = <code>(a_1+...+a_n) + 1 = 2B + 1</code>, which exactly equals
        the horizon length <code>[0, 2B+1]</code> spanned by the earliest release and latest
        deadline. So <strong>any</strong> feasible schedule must run with zero idle time, back
        to back, filling <code>[0, 2B+1]</code> completely.</p>

      <p><code>J_(n+1)</code>'s window <code>[B, B+1]</code> has width exactly{" "}
        <code>1 = p_(n+1)</code> — no slack. In a zero-idle schedule, that forces{" "}
        <code>J_(n+1)</code> to start at exactly <code>B</code> and finish at exactly{" "}
        <code>B+1</code>; everything before it must occupy <code>[0, B]</code> with no gaps,
        and everything after it must occupy <code>[B+1, 2B+1]</code> with no gaps.</p>

      <p className="note"><strong>⇒</strong> A feasible schedule exists only if the jobs{" "}
        <code>J_1..J_n</code> split into two groups — one filling <code>[0,B]</code> (total
        processing time <code>B</code>), the other filling <code>[B+1, 2B+1]</code> (total
        processing time <code>B</code>) — i.e. only if some subset of{" "}
        <code>{"{a_1,...,a_n}"}</code> sums to exactly <code>B</code>.</p>
      <p className="note"><strong>⇐</strong> If PARTITION has a solution {"S"} (sum {"B"}):
        schedule {"S"}'s jobs in <code>[0,B]</code>, the blocker in <code>[B,B+1]</code>, the
        rest in <code>[B+1,2B+1]</code> — every release/deadline is satisfied by construction.
        Feasible.</p>

      <p>So the scheduling instance is feasible <strong>if and only if</strong> the PARTITION
        instance is a "yes" instance. The construction takes polynomial time (just arithmetic
        on the input numbers), so this is a valid polynomial reduction:{" "}
        <code>PARTITION ≤ₚ 1|r_j,d_j|-</code>.</p>

      <div className="answer-box">
        In NP (Step 1) + NP-hard via PARTITION (Step 2) ⇒ 1|r_j,d_j|- is NP-complete.
      </div>

      <p className="note">This particular reduction (from PARTITION) only shows ordinary
        NP-completeness. The stronger result — that <code>1|r_j,d_j|-</code> is{" "}
        <strong>strongly</strong> NP-complete (stays hard even with polynomially-bounded
        numbers) — needs a reduction from a strongly NP-complete source like 3-PARTITION
        instead; the structure of the proof is the same idea, just with multiple "blocker"
        jobs instead of one.</p>
    </div>
  );
}
