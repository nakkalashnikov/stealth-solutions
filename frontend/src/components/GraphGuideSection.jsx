// Task 3 is a teaching guide, not an input-driven generator: there's no
// shared sequence to sync here, so (unlike Task 1/2) this is just static
// content — a worked example on a small graph the student can map onto
// their own larger one.

export default function GraphGuideSection() {
  return (
    <div>
      <p>This task has no single right "input" the way Task 1/2 do — your graph is whatever
        is on your sheet. So instead of a generator, here's the method worked through on a
        small, unambiguous example. Apply the exact same four steps to your own graph.</p>

      <h4>1. DFS and BFS — traversal order</h4>
      <p><strong>Convention:</strong> when a vertex has multiple unvisited neighbors, always
        go to the <strong>smallest-numbered</strong> one first. This matters — a different
        tie-break gives a different (still "valid" in general, but not matching the expected
        answer) order.</p>

      <p>Example graph (undirected), two components:</p>
      <pre className="diagram">{`1 — 2        5 — 6
1 — 3
2 — 4
3 — 4`}</pre>

      <p><strong>DFS from vertex 1</strong> ("go as deep as possible, always into the smallest
        unvisited neighbor; backtrack when stuck"):</p>
      <ol className="steps">
        <li>At 1 → neighbors {"{2, 3}"} → go to the smaller: <strong>2</strong></li>
        <li>At 2 → neighbors {"{1 (visited), 4}"} → go to <strong>4</strong></li>
        <li>At 4 → neighbors {"{2 (visited), 3}"} → go to <strong>3</strong></li>
        <li>At 3 → neighbors {"{1, 4}"} — both visited → backtrack, nowhere left to go</li>
      </ol>
      <div className="answer-box">DFS: 1, 2, 4, 3</div>

      <p><strong>BFS from vertex 1</strong> ("dequeue a vertex, enqueue all its unvisited
        neighbors in increasing order, repeat"):</p>
      <ol className="steps">
        <li>Queue [1] → process 1, neighbors {"{2, 3}"} → enqueue in order → queue [2, 3]</li>
        <li>Process 2, neighbors {"{1 (done), 4}"} → enqueue 4 → queue [3, 4]</li>
        <li>Process 3, neighbors {"{1 (done), 4 (already queued)}"} → nothing new</li>
        <li>Process 4, neighbors {"{2, 3} (both done)"} → nothing new</li>
      </ol>
      <div className="answer-box">BFS: 1, 2, 3, 4</div>

      <h4>2. Checking connectivity</h4>
      <p><strong>Rule:</strong> run DFS (or BFS) from any one vertex. If it reaches every
        vertex in the graph, the graph is connected. If not, each such run (started from an
        unvisited vertex) uncovers exactly one <strong>connected component</strong>.</p>
      <p>In the example: DFS from 1 only reached {"{1, 2, 3, 4}"} — vertices 5 and 6 were never
        visited.</p>
      <p className="note">The graph is <strong>not connected</strong>. Connected components:
        {" "}{"{1, 2, 3, 4}"} and {"{5, 6}"} (the second one shows up once you run another DFS
        starting at 5).</p>
      <p>For your own graph: do exactly this — one DFS pass from any vertex, check whether
        every vertex got visited. If some didn't, list them and run DFS again starting from
        one of them — that's your second component.</p>

      <h4>3. Bi-connectedness</h4>
      <p>A graph is <strong>bi-connected</strong> if it's (a) connected, <em>and</em> (b) has
        no <strong>articulation point</strong> — a vertex whose removal disconnects the
        remaining graph.</p>
      <p><strong>Practical check (no need for a formal algorithm at this level):</strong>{" "}
        for each vertex <code>v</code>, mentally remove it (and its edges) and re-run the
        connectivity test from step 2 on what's left.</p>
      <ul className="steps">
        <li>If removing <em>any</em> single vertex disconnects the graph → that vertex is an
          articulation point → the graph is <strong>not</strong> bi-connected.</li>
        <li>If no single removal disconnects it → the graph <strong>is</strong> bi-connected.</li>
      </ul>
      <p>In the example's first component (cycle 1–2–4–3–1): removing vertex 2 leaves
        1–3–4, still connected. Removing vertex 1 leaves 2–4–3, still connected — no
        articulation point, so <em>that component</em> is bi-connected. But the graph as a
        whole isn't connected in the first place (component {"{5, 6}"} is separate), so the
        whole graph is <strong>not bi-connected</strong> — bi-connectedness requires ordinary
        connectivity as a precondition.</p>
      <p className="note">The usual giveaway in an exam answer: a single edge connecting two
        otherwise-separate parts of the graph (a "bridge") means either endpoint of that edge
        is an articulation point — removing it splits the graph in two.</p>

      <h4>4. Topological order (DFS with discovery/finish times)</h4>
      <p>This only works on a <strong>directed acyclic graph (DAG)</strong>.</p>
      <ol className="steps">
        <li>Run DFS. The first time you visit a vertex, stamp it with an increasing counter —
          its <strong>discovery time</strong> <code>d</code>.</li>
        <li>When DFS is completely done exploring a vertex (no more unvisited neighbors to
          descend into), stamp it with the next counter value — its <strong>finish
          time</strong> <code>f</code> (same shared counter as <code>d</code>).</li>
        <li>If you ever follow an edge to a vertex that's still on the current call stack (an
          ancestor in the DFS tree) — that's a <strong>back edge</strong>, meaning the graph
          has a cycle, and <strong>no topological order exists</strong>.</li>
        <li>If there's no cycle, the topological order is just the vertices sorted by{" "}
          <strong>decreasing finish time</strong>.</li>
      </ol>

      <p>Example DAG:</p>
      <pre className="diagram">{`A → B → D
A → C → D
C → E`}</pre>

      <p>DFS from A (smallest/alphabetical neighbor first):</p>
      <ol className="steps">
        <li>A: d=1</li>
        <li>→ B: d=2</li>
        <li>→ → D: d=3, no outgoing edges → f=4</li>
        <li>← B done → f=5</li>
        <li>← back at A, go to C: d=6</li>
        <li>→ → D already visited <em>and already finished</em> — a forward/cross edge, not a
          back edge, so still no cycle — just skip it</li>
        <li>→ → E: d=7, no outgoing edges → f=8</li>
        <li>← C done → f=9</li>
        <li>← A done → f=10</li>
      </ol>

      <p>Finish times: D=4, B=5, E=8, C=9, A=10.</p>
      <div className="answer-box">Topological order (decreasing finish time): A, C, E, B, D</div>
      <p>Check: A comes before B and C ✓, B before D ✓, C before D and E ✓ — valid.</p>

      <p className="note">If your graph isn't a DAG, the proof is to point at the specific
        back edge you found during DFS — e.g. "edge X→Y exists, but Y is currently an
        ancestor of X in the DFS call stack" — that single edge is the cycle witness.</p>

      <h4>5. Complexity</h4>
      <p>DFS, BFS, and topological sort (which is just DFS with finish-time bookkeeping) all
        run in <strong>O(V + E)</strong> — every vertex and every edge gets processed a
        constant number of times. This is linear in the size of the graph regardless of its
        shape — there's no "unlucky input" the way Quick Sort has a worst case.</p>

      <p className="note">To apply this to your own sheet: take your actual vertex/edge list
        and run the same four steps — DFS from the smallest neighbor, BFS with a queue,
        the removal test for connectivity/bi-connectedness, and the discovery/finish-time DFS
        for topological order. The method doesn't change; only the graph does.</p>
    </div>
  );
}
