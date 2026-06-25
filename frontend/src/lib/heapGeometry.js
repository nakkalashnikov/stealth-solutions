// Pure layout math, ported from the vanilla-JS drawHeapSVG — returns
// positions/viewBox for a <HeapTree> component to render as JSX instead of
// a hand-built SVG string.

const UNIT = 64;
export const RADIUS = 22;

export function layoutHeap(n) {
  if (n === 0) return { positions: [], viewBox: "0 0 1 1" };
  const depth = Math.floor(Math.log2(n)) + 1;
  const maxSlots = 2 ** (depth - 1);

  const positions = [];
  for (let i = 0; i < n; i++) {
    const level = Math.floor(Math.log2(i + 1));
    const posInLevel = i - (2 ** level - 1);
    const slots = 2 ** level;
    positions.push({
      x: ((posInLevel + 0.5) / slots) * maxSlots * UNIT,
      y: level * UNIT,
    });
  }

  const xs = positions.map((p) => p.x);
  const ys = positions.map((p) => p.y);
  const pad = RADIUS + 18;
  const minX = Math.min(...xs) - pad, maxX = Math.max(...xs) + pad;
  const minY = Math.min(...ys) - pad, maxY = Math.max(...ys) + pad;

  return { positions, viewBox: `${minX} ${minY} ${maxX - minX} ${maxY - minY}` };
}

export function edgesOf(n) {
  const edges = [];
  for (let i = 0; i < n; i++) {
    for (const child of [2 * i + 1, 2 * i + 2]) {
      if (child < n) edges.push([i, child]);
    }
  }
  return edges;
}

// Shrinks a swap-arrow segment so it stops at the circle's edge instead of
// crossing through the node's number.
export function shrinkToEdge(p0, p1, gap = RADIUS + 6) {
  const dx = p1.x - p0.x, dy = p1.y - p0.y;
  const dist = Math.hypot(dx, dy) || 1;
  const ux = dx / dist, uy = dy / dist;
  return {
    x1: p0.x + ux * gap, y1: p0.y + uy * gap,
    x2: p1.x - ux * gap, y2: p1.y - uy * gap,
  };
}
