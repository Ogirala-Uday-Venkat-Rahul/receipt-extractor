// A stylized paper-receipt illustration for the hero. Vector art so it ships in
// the bundle, scales crisply, and picks up the brand gradient.
export default function HeroArt() {
  return (
    <svg
      className="hero-svg"
      viewBox="0 0 260 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Illustration of a paper receipt validated into structured data"
    >
      <defs>
        <linearGradient id="paper" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#252b4e" />
          <stop offset="1" stopColor="#1a1f3d" />
        </linearGradient>
        <linearGradient id="brand" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6b8cff" />
          <stop offset="0.55" stopColor="#b18cff" />
          <stop offset="1" stopColor="#e879c9" />
        </linearGradient>
        <filter id="soft" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="18" stdDeviation="22" floodColor="#6b8cff" floodOpacity="0.3" />
        </filter>
      </defs>

      <g filter="url(#soft)" transform="rotate(-5 130 150)">
        <path
          d="M64,44 q0,-12 12,-12 h108 q12,0 12,12 V232
             l-11,8 l-11,-8 l-11,8 l-11,-8 l-11,8 l-11,-8
             l-11,8 l-11,-8 l-11,8 l-11,-8 l-11,8 l-11,-8 Z"
          fill="url(#paper)"
          stroke="#3c4573"
          strokeWidth="1"
        />
        <rect x="84" y="56" width="72" height="12" rx="4" fill="url(#brand)" />
        <rect x="84" y="82" width="84" height="6" rx="3" fill="#3c4573" />
        <rect x="84" y="96" width="72" height="6" rx="3" fill="#333a5f" />
        <rect x="84" y="110" width="80" height="6" rx="3" fill="#333a5f" />
        <line x1="84" y1="128" x2="176" y2="128" stroke="#3c4573" strokeWidth="1.5" strokeDasharray="4 4" />
        <rect x="84" y="140" width="46" height="6" rx="3" fill="#333a5f" />
        <rect x="150" y="140" width="26" height="6" rx="3" fill="#4a5488" />
        <rect x="84" y="154" width="52" height="6" rx="3" fill="#333a5f" />
        <rect x="150" y="154" width="26" height="6" rx="3" fill="#4a5488" />
        <rect x="84" y="176" width="40" height="8" rx="4" fill="#8ba4ff" />
        <rect x="146" y="176" width="30" height="8" rx="4" fill="url(#brand)" />
        <g fill="#6a7285">
          <rect x="84" y="198" width="3" height="22" />
          <rect x="90" y="198" width="2" height="22" />
          <rect x="95" y="198" width="4" height="22" />
          <rect x="102" y="198" width="2" height="22" />
          <rect x="107" y="198" width="3" height="22" />
          <rect x="113" y="198" width="2" height="22" />
          <rect x="118" y="198" width="4" height="22" />
          <rect x="125" y="198" width="2" height="22" />
          <rect x="130" y="198" width="3" height="22" />
          <rect x="136" y="198" width="4" height="22" />
          <rect x="143" y="198" width="2" height="22" />
          <rect x="148" y="198" width="3" height="22" />
        </g>
      </g>

      <g filter="url(#soft)">
        <circle cx="196" cy="84" r="26" fill="url(#brand)" />
        <path
          d="M184,84 l8,8 l16,-17"
          stroke="#fff"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
