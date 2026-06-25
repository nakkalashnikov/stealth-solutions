// Heap Sort + Quick Sort: trace the real algorithms on whatever array the
// user types in, then render the steps. No backend, no pre-generated assets —
// everything below runs in the browser.

const DEFAULT_ARRAY = [12, 3, 5, 43, 16, 15, 17, 0, 1, 5, 0, 89, 23];
const MAX_N = 31; // keeps the heap tree at <=5 levels, readable on small screens

// ---------- Heap Sort trace ----------

function heapSortTrace(arr) {
  const a = arr.slice();
  const n = a.length;
  const events = [{ type: "initial", snapshot: a.slice() }];
  let callId = 0;

  function siftDown(start, heapSize) {
    callId += 1;
    const id = callId;
    events.push({ type: "call_start", callId: id, startIndex: start, snapshot: a.slice() });
    let i = start;
    while (true) {
      const left = 2 * i + 1, right = 2 * i + 2;
      let largest = i;
      if (left < heapSize && a[left] > a[largest]) largest = left;
      if (right < heapSize && a[right] > a[largest]) largest = right;
      if (largest === i) break;
      [a[i], a[largest]] = [a[largest], a[i]];
      events.push({ type: "swap", callId: id, pair: [i, largest], snapshot: a.slice() });
      i = largest;
    }
    events.push({ type: "call_end", callId: id, startIndex: start, snapshot: a.slice() });
  }

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) siftDown(i, n);
  events.push({ type: "heap_built", snapshot: a.slice() });

  for (let end = n - 1; end > 0; end--) {
    [a[0], a[end]] = [a[end], a[0]];
    events.push({ type: "extract_swap", pair: [0, end], snapshot: a.slice(), heapSize: end });
    siftDown(0, end);
    events.push({ type: "extract_done", snapshot: a.slice(), heapSize: end });
  }
  events.push({ type: "sorted", snapshot: a.slice() });
  return events;
}

// ---------- Quick Sort trace (Hoare partition, pivot = middle element) ----------

function quickSortTrace(arr) {
  const a = arr.slice();
  const events = [{ type: "initial", snapshot: a.slice() }];

  function partition(lo, hi) {
    const mid = Math.floor((lo + hi) / 2);
    const pivot = a[mid];
    events.push({ type: "pivot", lo, hi, pivotIndex: mid, pivotValue: pivot, snapshot: a.slice() });
    let i = lo - 1, j = hi + 1;
    while (true) {
      do { i += 1; } while (a[i] < pivot);
      do { j -= 1; } while (a[j] > pivot);
      events.push({ type: "stop", lo, hi, pivotIndex: mid, i, j, snapshot: a.slice() });
      if (i >= j) {
        events.push({ type: "partition_done", lo, hi, split: j, snapshot: a.slice() });
        return j;
      }
      [a[i], a[j]] = [a[j], a[i]];
      events.push({ type: "swap", lo, hi, pivotIndex: mid, pair: [i, j], snapshot: a.slice() });
    }
  }

  function quicksort(lo, hi) {
    if (lo < hi) {
      const p = partition(lo, hi);
      quicksort(lo, p);
      quicksort(p + 1, hi);
    }
  }

  quicksort(0, a.length - 1);
  events.push({ type: "sorted", snapshot: a.slice() });
  return events;
}

// ---------- SVG heap-tree renderer ----------

function drawHeapSVG(array, { highlightIndices = new Set(), swapChain = [], dimFrom = null } = {}) {
  const n = array.length;
  if (n === 0) return "";
  const depth = Math.floor(Math.log2(n)) + 1;
  const maxSlots = 2 ** (depth - 1);
  const unit = 64;
  const radius = 22;

  const pos = {};
  for (let i = 0; i < n; i++) {
    const level = Math.floor(Math.log2(i + 1));
    const posInLevel = i - (2 ** level - 1);
    const slots = 2 ** level;
    pos[i] = { x: ((posInLevel + 0.5) / slots) * maxSlots * unit, y: level * unit };
  }

  const xs = Object.values(pos).map((p) => p.x);
  const ys = Object.values(pos).map((p) => p.y);
  const pad = radius + 18;
  const minX = Math.min(...xs) - pad, maxX = Math.max(...xs) + pad;
  const minY = Math.min(...ys) - pad, maxY = Math.max(...ys) + pad;

  const swappedIdx = new Set(swapChain.flat());
  let svg = `<svg viewBox="${minX} ${minY} ${maxX - minX} ${maxY - minY}" class="heap-svg" xmlns="http://www.w3.org/2000/svg">`;
  svg += `<defs><marker id="arrowhead" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill="#caa53f"/></marker></defs>`;

  for (let i = 0; i < n; i++) {
    for (const child of [2 * i + 1, 2 * i + 2]) {
      if (child < n) {
        svg += `<line x1="${pos[i].x}" y1="${pos[i].y}" x2="${pos[child].x}" y2="${pos[child].y}" stroke="#555" stroke-width="1.3"/>`;
      }
    }
  }

  for (let i = 0; i < n; i++) {
    const { x, y } = pos[i];
    const faded = dimFrom !== null && i >= dimFrom;
    let face = "#f2f2f2", edge = "#9a9a9a", text = "#161616";
    if (swappedIdx.has(i)) { face = "#ffd76e"; edge = "#caa53f"; text = "#2a1f00"; }
    else if (highlightIndices.has(i)) { face = "#6cb6ff"; edge = "#3d86c9"; text = "#06223c"; }
    else if (faded) { face = "#2a2a2a"; edge = "#444"; text = "#777"; }

    svg += `<circle cx="${x}" cy="${y + 4}" r="${radius}" fill="#000" opacity="0.25"/>`;
    svg += `<circle cx="${x}" cy="${y}" r="${radius}" fill="${face}" stroke="${edge}" stroke-width="1.6"/>`;
    svg += `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" font-size="15" font-weight="bold" fill="${text}">${array[i]}</text>`;
  }

  swapChain.forEach(([i, j], order) => {
    const p0 = pos[i], p1 = pos[j];
    const dx = p1.x - p0.x, dy = p1.y - p0.y;
    const dist = Math.hypot(dx, dy) || 1;
    const gap = radius + 6;
    const ux = dx / dist, uy = dy / dist;
    const x1 = p0.x + ux * gap, y1 = p0.y + uy * gap;
    const x2 = p1.x - ux * gap, y2 = p1.y - uy * gap;
    svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#caa53f" stroke-width="1.6" marker-end="url(#arrowhead)" marker-start="url(#arrowhead)"/>`;
    if (swapChain.length > 1) {
      const mx = (p0.x + p1.x) / 2, my = (p0.y + p1.y) / 2 - 16;
      svg += `<circle cx="${mx}" cy="${my}" r="10" fill="#1b1b1b" stroke="#ffd76e" stroke-width="1.2"/>`;
      svg += `<text x="${mx}" y="${my}" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="bold" fill="#ffd76e">${order + 1}</text>`;
    }
  });

  svg += "</svg>";
  return svg;
}

function treeFigure(svg, caption) {
  return `<figure class="tree-figure">${svg}${caption ? `<figcaption>${caption}</figcaption>` : ""}</figure>`;
}

// ---------- array-row renderer ----------

function renderArrayRow(snapshot, { pivotIndex = null, i = null, j = null, swapPair = [], fixedRange = null } = {}) {
  let cellRow = '<div class="array-row">';
  let ptrRow = '<div class="array-row ptr-row">';
  let needsPtrRow = i !== null || j !== null;

  snapshot.forEach((val, idx) => {
    const cls = ["cell"];
    if (idx === pivotIndex) cls.push("pivot");
    else if (swapPair.includes(idx)) cls.push("swap");
    else if (fixedRange && (idx < fixedRange[0] || idx > fixedRange[1])) cls.push("fixed");
    cellRow += `<span class="${cls.join(" ")}">${val}</span>`;

    let label = "";
    if (idx === i && idx === j) label = "i j";
    else if (idx === i) label = "i";
    else if (idx === j) label = "j";
    ptrRow += `<span class="ptr">${label}</span>`;
  });
  cellRow += "</div>";
  ptrRow += "</div>";
  return needsPtrRow ? ptrRow + cellRow : cellRow;
}

// ---------- Heap Sort section builder ----------

function buildHeapSection(arr) {
  const n = arr.length;
  const events = heapSortTrace(arr);
  const lastParent = Math.floor(n / 2) - 1;
  let html = "";

  html += `<p>Child indices in the array-as-heap: <code>left = i·2+1</code>, <code>right = i·2+2</code>.
    The core operation is <strong>sift-down</strong>: starting at some index, compare a node with
    its children, and if a child is larger, swap them and continue sifting down from the
    child's position — repeat until the node has no larger child (or it's a leaf).</p>`;

  html += treeFigure(drawHeapSVG(arr), "Input array shown as a binary tree (not a heap yet)");

  html += `<h4>Phase 1 — build the max-heap</h4>`;
  html += `<p>Only nodes with at least one child can violate the heap property, so we only need to
    sift-down from index ⌊(n-2)/2⌋ = ${lastParent} (the last parent) down to index 0, where n = ${n}.
    Leaves never need to move.</p>`;

  // group events by callId, but only for calls before "heap_built"
  const buildEnd = events.findIndex((e) => e.type === "heap_built");
  const buildEvents = events.slice(0, buildEnd);
  const calls = {};
  const callOrder = [];
  for (const e of buildEvents) {
    if (e.type === "call_start") { calls[e.callId] = { startIndex: e.startIndex, swaps: [], before: e.snapshot }; callOrder.push(e.callId); }
    if (e.type === "swap") calls[e.callId].swaps.push(e.pair);
    if (e.type === "call_end") calls[e.callId].after = e.snapshot;
  }

  html += '<ol class="steps">';
  const noSwapIndices = [];
  for (const id of callOrder) {
    const call = calls[id];
    if (call.swaps.length === 0) {
      noSwapIndices.push(call.startIndex);
      continue;
    }
    const startVal = call.before[call.startIndex];
    const levels = call.swaps.length > 1 ? `cascades ${call.swaps.length} levels` : "one swap";
    html += `<li><strong>i = ${call.startIndex}</strong> (value ${startVal}): ${levels} —
      swaps with index ${call.swaps.map((p) => p[1]).join(", ")}.
      ${treeFigure(drawHeapSVG(call.after, { swapChain: call.swaps }))}</li>`;
  }
  if (noSwapIndices.length) {
    html += `<li><strong>i = ${noSwapIndices.join(", ")}</strong>: already satisfy "parent ≥ children" — no swap.</li>`;
  }
  html += "</ol>";

  const heapBuiltSnapshot = events[buildEnd].snapshot;
  html += treeFigure(drawHeapSVG(heapBuiltSnapshot), "Resulting max-heap — every parent is now ≥ its children");
  html += `<p><strong>Max-heap (array):</strong></p>`;
  html += renderArrayRow(heapBuiltSnapshot);

  html += `<h4>Phase 2 — repeatedly extract the maximum</h4>`;
  html += `<p>The root of a max-heap is always the largest remaining value. So: swap the root with the
    last element of the current heap (this puts the max in its final sorted slot), shrink the
    heap by one (the swapped-out tail is excluded — shown faded below), then sift-down the new
    root to restore the heap property. Repeat until the heap is empty.</p>`;

  // first extraction in detail
  const firstSwapIdx = buildEnd + 1; // extract_swap
  const firstSwap = events[firstSwapIdx];
  html += `<p><strong>Step 1:</strong> swap root (${heapBuiltSnapshot[0]}) with the last element (${heapBuiltSnapshot[n - 1]}):</p>`;
  html += treeFigure(
    drawHeapSVG(firstSwap.snapshot, { swapChain: [firstSwap.pair], dimFrom: n - 1 }),
    `${heapBuiltSnapshot[0]} is now fixed in its sorted position (faded node, excluded from the heap)`
  );

  // collect the sift-down swaps right after the first extract_swap
  let idx = firstSwapIdx + 1;
  const firstSiftSwaps = [];
  while (events[idx] && events[idx].type !== "call_end") {
    if (events[idx].type === "swap") firstSiftSwaps.push(events[idx].pair);
    idx += 1;
  }
  const afterFirstSift = events[idx] ? events[idx].snapshot : firstSwap.snapshot;
  if (firstSiftSwaps.length) {
    html += `<p>Sift-down the new root restores the heap, swapping ${firstSiftSwaps.length > 1 ? "through " + firstSiftSwaps.length + " levels" : "once"}:</p>`;
    html += treeFigure(drawHeapSVG(afterFirstSift, { swapChain: firstSiftSwaps, dimFrom: n - 1 }), `Heap restored over the remaining ${n - 1} elements`);
  }

  // summary table for the rest of the extractions
  const extractDoneEvents = events.filter((e) => e.type === "extract_done");
  if (extractDoneEvents.length > 1) {
    html += `<p>This swap-then-sift-down step repeats for the remaining elements, each time on a heap
      that's one element smaller:</p>`;
    html += '<table class="partition-log"><tr><th>Step</th><th>Heap size</th><th>Extracted value placed at</th><th>Array so far</th></tr>';
    extractDoneEvents.forEach((e, stepIdx) => {
      html += `<tr><td>${stepIdx + 1}</td><td>${e.heapSize}</td><td>index ${e.heapSize}</td><td><code>${e.snapshot.join(", ")}</code></td></tr>`;
    });
    html += "</table>";
  }

  const sortedSnapshot = events[events.length - 1].snapshot;
  html += `<p><strong>Sorted array:</strong></p>`;
  html += `<div class="answer-box">[${sortedSnapshot.join(", ")}]</div>`;

  html += `<p class="note"><strong>Complexity: O(n log n) in every case.</strong>
    Building the heap takes O(n), and then there are n-1 extractions, each costing O(log n)
    for the sift-down (the heap's height is always ⌊log₂ n⌋, regardless of how the input is
    ordered). Unlike Quick Sort, there's no "unlucky" input that makes a sift-down step take
    longer — so best case and worst case are the same here.</p>`;

  return html;
}

// ---------- Quick Sort section builder ----------

function buildQuickSection(arr) {
  const events = quickSortTrace(arr);
  let html = "";

  html += `<p>Partition scheme: <strong>Hoare partition, pivot = middle element</strong>.
    For range <code>[lo, hi]</code>: <code>pivot = a[(lo+hi)/2]</code>, start
    <code>i = lo - 1</code> and <code>j = hi + 1</code>. Then repeat: move <code>i</code>
    right while <code>a[i] &lt; pivot</code>, move <code>j</code> left while
    <code>a[j] &gt; pivot</code>. If <code>i &gt;= j</code>, the partition is done (the split
    point is <code>j</code>); otherwise swap <code>a[i]</code> and <code>a[j]</code> and
    continue.</p>`;

  const firstPivot = events.find((e) => e.type === "pivot");
  html += `<h4>First partition — range [${firstPivot.lo}, ${firstPivot.hi}], pivot = ${firstPivot.pivotValue} (index ${firstPivot.pivotIndex})</h4>`;
  html += `<p><code>i</code> starts before index ${firstPivot.lo}, <code>j</code> starts after index ${firstPivot.hi}.</p>`;
  html += renderArrayRow(firstPivot.snapshot, { pivotIndex: firstPivot.pivotIndex });

  let firstPartitionDone = false;
  for (const e of events) {
    if (e.type === "pivot" && e !== firstPivot) break;
    if (firstPartitionDone) break;
    if (e.type === "stop") {
      html += `<p><code>i</code> stops at index ${e.i} (value ${e.snapshot[e.i]}), <code>j</code> stops at index ${e.j} (value ${e.snapshot[e.j]}).${e.i >= e.j ? " Since i ≥ j, the partition is done." : ""}</p>`;
      html += renderArrayRow(e.snapshot, { pivotIndex: e.pivotIndex, i: e.i, j: e.j });
    }
    if (e.type === "swap") {
      html += `<p>Swap <code>a[${e.pair[0]}]</code> and <code>a[${e.pair[1]}]</code>:</p>`;
      html += renderArrayRow(e.snapshot, { pivotIndex: e.pivotIndex, swapPair: e.pair });
    }
    if (e.type === "partition_done") {
      html += `<p><strong>Partition done</strong> — split point = ${e.split}. The array is now split
        into <code>[${e.lo}..${e.split}]</code> and <code>[${e.split + 1}..${e.hi}]</code>,
        each gets quicksorted recursively the same way as above.</p>`;
      firstPartitionDone = true;
    }
  }

  const pivots = events.filter((e) => e.type === "pivot");
  const dones = events.filter((e) => e.type === "partition_done");
  if (pivots.length > 1) {
    html += `<h4>Remaining partitions (full log)</h4>`;
    html += `<p>Every recursive call follows the exact same procedure. Here's the complete trace so
      you can verify each step yourself:</p>`;
    html += '<table class="partition-log"><tr><th>Range</th><th>Pivot</th><th>Result</th><th>Sub-array after partitioning</th></tr>';
    pivots.forEach((piv, idx) => {
      const done = dones[idx];
      const sub = done.snapshot.slice(piv.lo, piv.hi + 1);
      html += `<tr><td>[${piv.lo}..${piv.hi}]</td><td>${piv.pivotValue} (idx ${piv.pivotIndex})</td><td>split at ${done.split}</td><td><code>${sub.join(", ")}</code></td></tr>`;
    });
    html += "</table>";
  }

  const sortedSnapshot = events[events.length - 1].snapshot;
  html += `<p><strong>Sorted array:</strong></p>`;
  html += `<div class="answer-box">[${sortedSnapshot.join(", ")}]</div>`;

  html += `<p class="note"><strong>Complexity: O(n log n) on average, O(n²) worst case.</strong>
    Each partition is O(n), and on average the split is roughly balanced, giving O(log n)
    levels of recursion — same shape as Merge Sort. But unlike Heap Sort, a consistently
    unlucky pivot choice (e.g. always picking the smallest or largest element) makes one side
    of the partition empty every time, degrading to n levels of recursion: O(n²). Picking the
    <em>middle</em> element as pivot (as done here) avoids the classic worst case for
    already-sorted/reverse-sorted input, but a worst case still exists for specially crafted
    input.</p>`;

  return html;
}

// ---------- shared-sequence sync ----------
//
// Sync contract for whoever builds the backend:
//   GET  /api/sequence   -> { "sequence": [12, 3, 5, ...] }
//   POST /api/sequence   <- { "sequence": [12, 3, 5, ...] }   (body is the new shared sequence)
// The page polls GET every POLL_MS and re-renders for everyone whenever the
// sequence changes. Until that endpoint exists, fetch() fails silently and
// the page just behaves as a local-only tool with DEFAULT_ARRAY.

const API_URL = "/api/sequence";
const POLL_MS = 4000;
let lastKnownSequence = null;

async function fetchSharedSequence() {
  try {
    const res = await fetch(API_URL, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data.sequence) ? data.sequence : null;
  } catch {
    return null;
  }
}

async function postSharedSequence(arr) {
  try {
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sequence: arr }),
    });
  } catch {
    // no backend yet — the page still works locally, it just won't sync
  }
}

function sequencesEqual(a, b) {
  return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((v, i) => v === b[i]);
}

// ---------- wiring ----------

function renderTask(arr) {
  document.getElementById("heap-sort-content").innerHTML = buildHeapSection(arr);
  document.getElementById("quick-sort-content").innerHTML = buildQuickSection(arr);
  document.getElementById("task-input-display").textContent = `[${arr.join(", ")}]`;
  lastKnownSequence = arr;
}

function parseArrayInput(text) {
  return text
    .split(/[\s,]+/)
    .filter((s) => s.length > 0)
    .map(Number);
}

function validateSequence(arr) {
  if (arr.length === 0 || arr.some((x) => Number.isNaN(x))) return "Enter numbers separated by commas or spaces.";
  if (arr.length < 2) return "Enter at least 2 numbers.";
  if (arr.length > MAX_N) return `Keep it to ${MAX_N} numbers or fewer so the tree stays readable.`;
  return null;
}

document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("sequence-form");
  const input = document.getElementById("sequence-input");
  const error = document.getElementById("sequence-error");

  const shared = await fetchSharedSequence();
  const initial = shared || DEFAULT_ARRAY;
  renderTask(initial);
  input.value = initial.join(", ");

  form.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const arr = parseArrayInput(input.value);
    const validationError = validateSequence(arr);
    error.textContent = validationError || "";
    if (validationError) return;

    renderTask(arr); // optimistic local update
    postSharedSequence(arr); // push to everyone else
  });

  // pick up changes made by other people, on whatever device they're on
  setInterval(async () => {
    if (document.activeElement === input) return; // don't yank the input while someone's typing
    const remote = await fetchSharedSequence();
    if (remote && !sequencesEqual(remote, lastKnownSequence)) {
      renderTask(remote);
      input.value = remote.join(", ");
    }
  }, POLL_MS);
});
