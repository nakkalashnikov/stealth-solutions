// Purely presentational — the standard P/NP/NP-complete/NP-hard schema
// (assuming P != NP), not a pixel-for-pixel transcription of the photo.
export default function ComplexityVennDiagram() {
  return (
    <figure className="tree-figure">
      <svg viewBox="0 0 420 260" className="heap-svg" xmlns="http://www.w3.org/2000/svg">
        {/* NP ellipse */}
        <ellipse cx="170" cy="130" rx="130" ry="105" fill="#1c4566" fillOpacity="0.35"
                  stroke="#6cb6ff" strokeWidth="1.6" />
        {/* NP-hard ellipse */}
        <ellipse cx="280" cy="130" rx="130" ry="105" fill="#6b5300" fillOpacity="0.35"
                  stroke="#caa53f" strokeWidth="1.6" />

        {/* P circle, inside NP only */}
        <circle cx="95" cy="175" r="38" fill="#1f5c2a" fillOpacity="0.6" stroke="#4fcf6a" strokeWidth="1.6" />
        <text x="95" y="170" textAnchor="middle" fontSize="15" fontWeight="bold" fill="#c9f5d2">P</text>
        <text x="95" y="190" textAnchor="middle" fontSize="10" fill="#c9f5d2">Sorting</text>

        {/* NPC / SNPC divider inside the overlap lens */}
        <line x1="205" y1="55" x2="245" y2="205" stroke="#ececec" strokeWidth="1.2" strokeDasharray="4 3" />
        <text x="195" y="100" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#ececec">NPC</text>
        <text x="255" y="175" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#ececec">SNPC</text>
        <text x="225" y="118" textAnchor="middle" fontSize="9" fill="#ececec">1|r_j,d_j|-</text>

        <text x="55" y="40" fontSize="16" fontWeight="bold" fill="#6cb6ff">NP</text>
        <text x="55" y="56" fontSize="10" fill="#6cb6ff">Graph Isomorphism</text>
        <text x="330" y="40" fontSize="16" fontWeight="bold" fill="#caa53f">NP-hard</text>
        <text x="318" y="56" fontSize="10" fill="#caa53f">TSP (optimization)</text>
      </svg>
      <figcaption>P ⊊ NP, NP-hard ⊇ NP-complete = NP ∩ NP-hard, SNPC ⊂ NPC — assuming P ≠ NP</figcaption>
    </figure>
  );
}
