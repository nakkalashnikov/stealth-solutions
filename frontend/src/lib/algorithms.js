// Ported unchanged from the original vanilla-JS prototype (script.js) — same
// trace logic, just living in its own module now so React components can
// import it instead of building HTML strings.

export const MIN_N = 2;
export const MAX_N = 31; // keeps the heap tree at <=5 levels, readable on small screens

export function heapSortTrace(arr) {
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

// Hoare partition, pivot = middle element.
export function quickSortTrace(arr) {
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

export function validateSequence(arr) {
  if (arr.length === 0 || arr.some((x) => Number.isNaN(x))) return "Enter numbers separated by commas or spaces.";
  if (arr.length < MIN_N) return "Enter at least 2 numbers.";
  if (arr.length > MAX_N) return `Keep it to ${MAX_N} numbers or fewer so the tree stays readable.`;
  return null;
}

export function parseArrayInput(text) {
  return text
    .split(/[\s,]+/)
    .filter((s) => s.length > 0)
    .map(Number);
}
