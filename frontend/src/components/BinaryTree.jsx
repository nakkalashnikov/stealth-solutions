import { layoutBinaryTree, RADIUS } from "../lib/binaryTreeGeometry.js";

export default function BinaryTree({ root, highlightValues = new Set(), caption }) {
  const { nodes, edges, viewBox } = layoutBinaryTree(root);
  if (nodes.length === 0) return null;

  return (
    <figure className="tree-figure">
      <svg viewBox={viewBox} className="heap-svg" xmlns="http://www.w3.org/2000/svg">
        {edges.map(([from, to]) => (
          <line key={`${from.id}-${to.id}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                stroke="#555" strokeWidth="1.3" />
        ))}

        {nodes.map((n) => {
          const isHighlighted = highlightValues.has(n.value);
          const face = isHighlighted ? "#ffd76e" : "#f2f2f2";
          const edge = isHighlighted ? "#caa53f" : "#9a9a9a";
          const text = isHighlighted ? "#2a1f00" : "#161616";

          return (
            <g key={n.id}>
              <circle cx={n.x} cy={n.y + 4} r={RADIUS} fill="#000" opacity="0.25" />
              <circle cx={n.x} cy={n.y} r={RADIUS} fill={face} stroke={edge} strokeWidth="1.6" />
              <text x={n.x} y={n.y} textAnchor="middle" dominantBaseline="central"
                    fontSize="15" fontWeight="bold" fill={text}>{n.value}</text>
            </g>
          );
        })}
      </svg>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}
