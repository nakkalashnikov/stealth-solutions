// Generic layout for an arbitrary {value, left, right} binary tree — unlike
// heapGeometry.js, node position can't be derived from an array index here,
// since shape depends on insertion order, not a fixed formula. x comes from
// in-order position (keeps left-to-right reading order), y from depth.

const UNIT_X = 56;
const UNIT_Y = 64;
export const RADIUS = 22;

export function layoutBinaryTree(root) {
  const nodes = []; // { id, value, x, y, left, right } — id is the in-order index
  let cursor = 0;

  function walk(node, depth) {
    if (!node) return null;
    const left = walk(node.left, depth + 1);
    const id = cursor++;
    const entry = { id, value: node.value, x: id * UNIT_X, y: depth * UNIT_Y, leftId: left, rightId: null };
    nodes.push(entry);
    entry.rightId = walk(node.right, depth + 1);
    return id;
  }
  walk(root, 0);

  if (nodes.length === 0) return { nodes: [], edges: [], viewBox: "0 0 1 1" };

  const xs = nodes.map((n) => n.x);
  const ys = nodes.map((n) => n.y);
  const pad = RADIUS + 18;
  const minX = Math.min(...xs) - pad, maxX = Math.max(...xs) + pad;
  const minY = Math.min(...ys) - pad, maxY = Math.max(...ys) + pad;

  const byId = new Map(nodes.map((n) => [n.id, n]));
  const edges = [];
  for (const n of nodes) {
    if (n.leftId !== null) edges.push([n, byId.get(n.leftId)]);
    if (n.rightId !== null) edges.push([n, byId.get(n.rightId)]);
  }

  return { nodes, edges, viewBox: `${minX} ${minY} ${maxX - minX} ${maxY - minY}` };
}
