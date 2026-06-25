import { heapSortTrace } from "../lib/algorithms.js";
import HeapTree from "./HeapTree.jsx";
import ArrayRow from "./ArrayRow.jsx";

export default function HeapSortSection({ sequence }) {
  const n = sequence.length;
  const events = heapSortTrace(sequence);
  const lastParent = Math.floor(n / 2) - 1;

  const buildEnd = events.findIndex((e) => e.type === "heap_built");
  const buildEvents = events.slice(0, buildEnd);
  const calls = {};
  const callOrder = [];
  for (const e of buildEvents) {
    if (e.type === "call_start") { calls[e.callId] = { startIndex: e.startIndex, swaps: [], before: e.snapshot }; callOrder.push(e.callId); }
    if (e.type === "swap") calls[e.callId].swaps.push(e.pair);
    if (e.type === "call_end") calls[e.callId].after = e.snapshot;
  }
  const noSwapIndices = [];
  const swapSteps = callOrder
    .map((id) => calls[id])
    .filter((call) => {
      if (call.swaps.length === 0) { noSwapIndices.push(call.startIndex); return false; }
      return true;
    });

  const heapBuiltSnapshot = events[buildEnd].snapshot;

  const firstSwapIdx = buildEnd + 1; // extract_swap
  const firstSwap = events[firstSwapIdx];
  let idx = firstSwapIdx + 1;
  const firstSiftSwaps = [];
  while (events[idx] && events[idx].type !== "call_end") {
    if (events[idx].type === "swap") firstSiftSwaps.push(events[idx].pair);
    idx += 1;
  }
  const afterFirstSift = events[idx] ? events[idx].snapshot : firstSwap.snapshot;

  const extractDoneEvents = events.filter((e) => e.type === "extract_done");
  const sortedSnapshot = events[events.length - 1].snapshot;

  return (
    <div>
      <p>Child indices in the array-as-heap: <code>left = i·2+1</code>, <code>right = i·2+2</code>.
        The core operation is <strong>sift-down</strong>: starting at some index, compare a node with
        its children, and if a child is larger, swap them and continue sifting down from the
        child's position — repeat until the node has no larger child (or it's a leaf).</p>

      <HeapTree array={sequence} caption="Input array shown as a binary tree (not a heap yet)" />

      <h4>Phase 1 — build the max-heap</h4>
      <p>Only nodes with at least one child can violate the heap property, so we only need to
        sift-down from index ⌊(n-2)/2⌋ = {lastParent} (the last parent) down to index 0, where n = {n}.
        Leaves never need to move.</p>

      <ol className="steps">
        {swapSteps.map((call, stepIdx) => {
          const startVal = call.before[call.startIndex];
          const levels = call.swaps.length > 1 ? `cascades ${call.swaps.length} levels` : "one swap";
          return (
            <li key={stepIdx}>
              <strong>i = {call.startIndex}</strong> (value {startVal}): {levels} —
              {" "}swaps with index {call.swaps.map((p) => p[1]).join(", ")}.
              <HeapTree array={call.after} swapChain={call.swaps} />
            </li>
          );
        })}
        {noSwapIndices.length > 0 && (
          <li><strong>i = {noSwapIndices.join(", ")}</strong>: already satisfy "parent ≥ children" — no swap.</li>
        )}
      </ol>

      <HeapTree array={heapBuiltSnapshot} caption="Resulting max-heap — every parent is now ≥ its children" />
      <p><strong>Max-heap (array):</strong></p>
      <ArrayRow snapshot={heapBuiltSnapshot} />

      <h4>Phase 2 — repeatedly extract the maximum</h4>
      <p>The root of a max-heap is always the largest remaining value. So: swap the root with the
        last element of the current heap (this puts the max in its final sorted slot), shrink the
        heap by one (the swapped-out tail is excluded — shown faded below), then sift-down the new
        root to restore the heap property. Repeat until the heap is empty.</p>

      <p><strong>Step 1:</strong> swap root ({heapBuiltSnapshot[0]}) with the last element ({heapBuiltSnapshot[n - 1]}):</p>
      <HeapTree array={firstSwap.snapshot} swapChain={[firstSwap.pair]} dimFrom={n - 1}
                caption={`${heapBuiltSnapshot[0]} is now fixed in its sorted position (faded node, excluded from the heap)`} />

      {firstSiftSwaps.length > 0 && (
        <>
          <p>Sift-down the new root restores the heap, swapping {firstSiftSwaps.length > 1 ? `through ${firstSiftSwaps.length} levels` : "once"}:</p>
          <HeapTree array={afterFirstSift} swapChain={firstSiftSwaps} dimFrom={n - 1}
                    caption={`Heap restored over the remaining ${n - 1} elements`} />
        </>
      )}

      {extractDoneEvents.length > 1 && (
        <>
          <p>This swap-then-sift-down step repeats for the remaining elements, each time on a heap
            that's one element smaller:</p>
          <table className="partition-log">
            <thead>
              <tr><th>Step</th><th>Heap size</th><th>Extracted value placed at</th><th>Array so far</th></tr>
            </thead>
            <tbody>
              {extractDoneEvents.map((e, stepIdx) => (
                <tr key={stepIdx}>
                  <td>{stepIdx + 1}</td><td>{e.heapSize}</td><td>index {e.heapSize}</td>
                  <td><code>{e.snapshot.join(", ")}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      <p><strong>Sorted array:</strong></p>
      <div className="answer-box">[{sortedSnapshot.join(", ")}]</div>

      <p className="note"><strong>Complexity: O(n log n) in every case.</strong>
        {" "}Building the heap takes O(n), and then there are n-1 extractions, each costing O(log n)
        for the sift-down (the heap's height is always ⌊log₂ n⌋, regardless of how the input is
        ordered). Unlike Quick Sort, there's no "unlucky" input that makes a sift-down step take
        longer — so best case and worst case are the same here.</p>
    </div>
  );
}
