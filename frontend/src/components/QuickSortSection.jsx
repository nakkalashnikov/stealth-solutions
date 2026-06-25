import { quickSortTrace } from "../lib/algorithms.js";
import ArrayRow from "./ArrayRow.jsx";

export default function QuickSortSection({ sequence }) {
  const events = quickSortTrace(sequence);
  const firstPivot = events.find((e) => e.type === "pivot");

  const firstPartitionFrames = [];
  let firstPartitionDone = false;
  for (const e of events) {
    if (e.type === "pivot" && e !== firstPivot) break;
    if (firstPartitionDone) break;
    if (e.type === "stop") firstPartitionFrames.push({ kind: "stop", e });
    if (e.type === "swap") firstPartitionFrames.push({ kind: "swap", e });
    if (e.type === "partition_done") { firstPartitionFrames.push({ kind: "done", e }); firstPartitionDone = true; }
  }

  const pivots = events.filter((e) => e.type === "pivot");
  const dones = events.filter((e) => e.type === "partition_done");
  const sortedSnapshot = events[events.length - 1].snapshot;

  return (
    <div>
      <p>Partition scheme: <strong>Hoare partition, pivot = middle element</strong>.
        For range <code>[lo, hi]</code>: <code>pivot = a[(lo+hi)/2]</code>, start
        <code>i = lo - 1</code> and <code>j = hi + 1</code>. Then repeat: move <code>i</code>
        right while <code>a[i] &lt; pivot</code>, move <code>j</code> left while
        <code>a[j] &gt; pivot</code>. If <code>i &gt;= j</code>, the partition is done (the split
        point is <code>j</code>); otherwise swap <code>a[i]</code> and <code>a[j]</code> and
        continue.</p>

      <h4>First partition — range [{firstPivot.lo}, {firstPivot.hi}], pivot = {firstPivot.pivotValue} (index {firstPivot.pivotIndex})</h4>
      <p><code>i</code> starts before index {firstPivot.lo}, <code>j</code> starts after index {firstPivot.hi}.</p>
      <ArrayRow snapshot={firstPivot.snapshot} pivotIndex={firstPivot.pivotIndex} />

      {firstPartitionFrames.map((frame, idx) => {
        const e = frame.e;
        if (frame.kind === "stop") {
          return (
            <div key={idx}>
              <p><code>i</code> stops at index {e.i} (value {e.snapshot[e.i]}), <code>j</code> stops at index {e.j} (value {e.snapshot[e.j]}).
                {e.i >= e.j ? " Since i ≥ j, the partition is done." : ""}</p>
              <ArrayRow snapshot={e.snapshot} pivotIndex={e.pivotIndex} i={e.i} j={e.j} />
            </div>
          );
        }
        if (frame.kind === "swap") {
          return (
            <div key={idx}>
              <p>Swap <code>a[{e.pair[0]}]</code> and <code>a[{e.pair[1]}]</code>:</p>
              <ArrayRow snapshot={e.snapshot} pivotIndex={e.pivotIndex} swapPair={e.pair} />
            </div>
          );
        }
        return (
          <p key={idx}><strong>Partition done</strong> — split point = {e.split}. The array is now split
            into <code>[{e.lo}..{e.split}]</code> and <code>[{e.split + 1}..{e.hi}]</code>,
            each gets quicksorted recursively the same way as above.</p>
        );
      })}

      {pivots.length > 1 && (
        <>
          <h4>Remaining partitions (full log)</h4>
          <p>Every recursive call follows the exact same procedure. Here's the complete trace so
            you can verify each step yourself:</p>
          <table className="partition-log">
            <thead>
              <tr><th>Range</th><th>Pivot</th><th>Result</th><th>Sub-array after partitioning</th></tr>
            </thead>
            <tbody>
              {pivots.map((piv, idx) => {
                const done = dones[idx];
                const sub = done.snapshot.slice(piv.lo, piv.hi + 1);
                return (
                  <tr key={idx}>
                    <td>[{piv.lo}..{piv.hi}]</td><td>{piv.pivotValue} (idx {piv.pivotIndex})</td>
                    <td>split at {done.split}</td><td><code>{sub.join(", ")}</code></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}

      <p><strong>Sorted array:</strong></p>
      <div className="answer-box">[{sortedSnapshot.join(", ")}]</div>

      <p className="note"><strong>Complexity: O(n log n) on average, O(n²) worst case.</strong>
        {" "}Each partition is O(n), and on average the split is roughly balanced, giving O(log n)
        levels of recursion — same shape as Merge Sort. But unlike Heap Sort, a consistently
        unlucky pivot choice (e.g. always picking the smallest or largest element) makes one side
        of the partition empty every time, degrading to n levels of recursion: O(n²). Picking the
        <em>middle</em> element as pivot (as done here) avoids the classic worst case for
        already-sorted/reverse-sorted input, but a worst case still exists for specially crafted
        input.</p>
    </div>
  );
}
