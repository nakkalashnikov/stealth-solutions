import { layoutHeap, edgesOf, shrinkToEdge, RADIUS } from "../lib/heapGeometry.js";

export default function HeapTree({ array, highlightIndices = new Set(), swapChain = [], dimFrom = null, caption }) {
  const n = array.length;
  if (n === 0) return null;
  const { positions, viewBox } = layoutHeap(n);
  const edges = edgesOf(n);
  const swappedIdx = new Set(swapChain.flat());

  return (
    <figure className="tree-figure">
      <svg viewBox={viewBox} className="heap-svg" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="arrowhead" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto">
            <path d="M0,0 L7,3.5 L0,7 Z" fill="#caa53f" />
          </marker>
        </defs>

        {edges.map(([from, to]) => (
          <line key={`${from}-${to}`} x1={positions[from].x} y1={positions[from].y}
                x2={positions[to].x} y2={positions[to].y} stroke="#555" strokeWidth="1.3" />
        ))}

        {positions.map((p, i) => {
          const faded = dimFrom !== null && i >= dimFrom;
          let face = "#f2f2f2", edge = "#9a9a9a", text = "#161616";
          if (swappedIdx.has(i)) { face = "#ffd76e"; edge = "#caa53f"; text = "#2a1f00"; }
          else if (highlightIndices.has(i)) { face = "#6cb6ff"; edge = "#3d86c9"; text = "#06223c"; }
          else if (faded) { face = "#2a2a2a"; edge = "#444"; text = "#777"; }

          return (
            <g key={i}>
              <circle cx={p.x} cy={p.y + 4} r={RADIUS} fill="#000" opacity="0.25" />
              <circle cx={p.x} cy={p.y} r={RADIUS} fill={face} stroke={edge} strokeWidth="1.6" />
              <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central"
                    fontSize="15" fontWeight="bold" fill={text}>{array[i]}</text>
            </g>
          );
        })}

        {swapChain.map(([i, j], order) => {
          const seg = shrinkToEdge(positions[i], positions[j]);
          const mx = (positions[i].x + positions[j].x) / 2;
          const my = (positions[i].y + positions[j].y) / 2 - 16;
          return (
            <g key={`${i}-${j}-${order}`}>
              <line x1={seg.x1} y1={seg.y1} x2={seg.x2} y2={seg.y2} stroke="#caa53f" strokeWidth="1.6"
                    markerEnd="url(#arrowhead)" markerStart="url(#arrowhead)" />
              {swapChain.length > 1 && (
                <>
                  <circle cx={mx} cy={my} r="10" fill="#1b1b1b" stroke="#ffd76e" strokeWidth="1.2" />
                  <text x={mx} y={my} textAnchor="middle" dominantBaseline="central"
                        fontSize="12" fontWeight="bold" fill="#ffd76e">{order + 1}</text>
                </>
              )}
            </g>
          );
        })}
      </svg>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}
