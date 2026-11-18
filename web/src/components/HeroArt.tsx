// Document & schema inspector preview for the hero.
// Designed with a warm editorial paper & print aesthetic: ivory receipt ticket,
// crisp charcoal typography, and subtle field-level extraction bounding boxes.
export default function HeroArt() {
  return (
    <svg
      className="hero-svg"
      viewBox="0 0 380 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Technical preview of receipt OCR token parsing and schema extraction"
    >
      <defs>
        <filter id="cardShadow" x="-5%" y="-5%" width="110%" height="115%">
          <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#1c1917" floodOpacity="0.08" />
        </filter>
      </defs>

      {/* Main Container */}
      <g filter="url(#cardShadow)">
        <rect
          x="10"
          y="10"
          width="360"
          height="300"
          rx="8"
          fill="#ffffff"
          stroke="#e5ded3"
          strokeWidth="1"
        />

        {/* Window Titlebar */}
        <line x1="10" y1="44" x2="370" y2="44" stroke="#f0ebe1" strokeWidth="1" />
        <circle cx="28" cy="27" r="3.5" fill="#d4c9b9" />
        <circle cx="40" cy="27" r="3.5" fill="#d4c9b9" />
        <circle cx="52" cy="27" r="3.5" fill="#d4c9b9" />
        <text
          x="70"
          y="31"
          fill="#78716c"
          fontSize="11"
          fontFamily="ui-monospace,SFMono-Regular,Menlo,monospace"
          fontWeight="500"
        >
          inspector // sample_042.txt
        </text>

        {/* Status Pill in Header */}
        <rect x="272" y="20" width="86" height="18" rx="4" fill="#f0fdf4" stroke="#bbf7d0" strokeWidth="1" />
        <circle cx="282" cy="29" r="2.5" fill="#16a34a" />
        <text
          x="289"
          y="32"
          fill="#15803d"
          fontSize="9"
          fontFamily="ui-monospace,SFMono-Regular,Menlo,monospace"
          fontWeight="600"
        >
          EXTRACTED
        </text>

        {/* Receipt Slip Container (Left) */}
        <rect
          x="24"
          y="58"
          width="196"
          height="236"
          rx="4"
          fill="#faf8f5"
          stroke="#e7e0d5"
          strokeWidth="1"
        />

        {/* Store Title Bounding Box (Vendor extraction) */}
        <rect x="34" y="68" width="146" height="20" rx="3" fill="#fff7ed" stroke="#ea580c" strokeWidth="1" />
        <text
          x="40"
          y="82"
          fill="#431407"
          fontSize="10"
          fontWeight="700"
          fontFamily="ui-monospace,SFMono-Regular,Menlo,monospace"
        >
          CAFE VERONA #104
        </text>
        <rect x="156" y="65" width="34" height="11" rx="2" fill="#c2410c" />
        <text
          x="160"
          y="73.5"
          fill="#ffffff"
          fontSize="7.5"
          fontWeight="600"
          fontFamily="ui-monospace,SFMono-Regular,Menlo,monospace"
        >
          vendor
        </text>

        {/* Address & Meta */}
        <text
          x="36"
          y="102"
          fill="#a8a29e"
          fontSize="8.5"
          fontFamily="ui-monospace,SFMono-Regular,Menlo,monospace"
        >
          220 HILL ST · SEATTLE WA
        </text>

        {/* Date Bounding Box */}
        <rect x="34" y="112" width="134" height="17" rx="3" fill="#f0fdfa" stroke="#0d9488" strokeWidth="1" />
        <text
          x="40"
          y="124"
          fill="#134e4a"
          fontSize="8.5"
          fontFamily="ui-monospace,SFMono-Regular,Menlo,monospace"
        >
          DATE: 2025-01-09 14:22
        </text>
        <rect x="148" y="109" width="26" height="10" rx="2" fill="#0f766e" />
        <text
          x="152"
          y="116.5"
          fill="#ffffff"
          fontSize="7"
          fontWeight="600"
          fontFamily="ui-monospace,SFMono-Regular,Menlo,monospace"
        >
          date
        </text>

        {/* Dashed divider */}
        <line x1="34" y1="138" x2="208" y2="138" stroke="#e5ded3" strokeWidth="1" strokeDasharray="3 3" />

        {/* Line Items Bounding Box */}
        <rect x="32" y="146" width="178" height="48" rx="3" fill="#f5f3ff" stroke="#7c3aed" strokeWidth="1" />
        <rect x="154" y="142" width="54" height="11" rx="2" fill="#6d28d9" />
        <text
          x="158"
          y="150"
          fill="#ffffff"
          fontSize="7"
          fontWeight="600"
          fontFamily="ui-monospace,SFMono-Regular,Menlo,monospace"
        >
          line_items [2]
        </text>

        <text x="40" y="162" fill="#2e1065" fontSize="8.5" fontFamily="ui-monospace,SFMono-Regular,Menlo,monospace">
          2 x Cappuccino
        </text>
        <text x="176" y="162" fill="#581c87" fontSize="8.5" fontFamily="ui-monospace,SFMono-Regular,Menlo,monospace">
          $9.00
        </text>
        <text x="40" y="182" fill="#2e1065" fontSize="8.5" fontFamily="ui-monospace,SFMono-Regular,Menlo,monospace">
          1 x Sourdough Loaf
        </text>
        <text x="176" y="182" fill="#581c87" fontSize="8.5" fontFamily="ui-monospace,SFMono-Regular,Menlo,monospace">
          $5.50
        </text>

        {/* Total Bounding Box */}
        <rect x="34" y="204" width="174" height="24" rx="3" fill="#f0fdf4" stroke="#16a34a" strokeWidth="1" />
        <text
          x="40"
          y="220"
          fill="#14532d"
          fontSize="10"
          fontWeight="700"
          fontFamily="ui-monospace,SFMono-Regular,Menlo,monospace"
        >
          TOTAL DUE: $24.30
        </text>
        <rect x="176" y="200" width="28" height="11" rx="2" fill="#15803d" />
        <text
          x="180"
          y="208"
          fill="#ffffff"
          fontSize="7"
          fontWeight="600"
          fontFamily="ui-monospace,SFMono-Regular,Menlo,monospace"
        >
          total
        </text>

        {/* Barcode */}
        <g fill="#78716c">
          <rect x="44" y="246" width="2" height="26" />
          <rect x="49" y="246" width="4" height="26" />
          <rect x="56" y="246" width="2" height="26" />
          <rect x="61" y="246" width="3" height="26" />
          <rect x="67" y="246" width="1" height="26" />
          <rect x="71" y="246" width="4" height="26" />
          <rect x="78" y="246" width="2" height="26" />
          <rect x="83" y="246" width="5" height="26" />
          <rect x="91" y="246" width="2" height="26" />
          <rect x="96" y="246" width="3" height="26" />
          <rect x="102" y="246" width="1" height="26" />
          <rect x="106" y="246" width="4" height="26" />
          <rect x="113" y="246" width="3" height="26" />
          <rect x="119" y="246" width="2" height="26" />
          <rect x="124" y="246" width="4" height="26" />
          <rect x="131" y="246" width="2" height="26" />
          <rect x="136" y="246" width="3" height="26" />
          <rect x="142" y="246" width="5" height="26" />
          <rect x="150" y="246" width="2" height="26" />
          <rect x="155" y="246" width="4" height="26" />
          <rect x="162" y="246" width="2" height="26" />
        </g>
        <text
          x="78"
          y="283"
          fill="#a8a29e"
          fontSize="7.5"
          fontFamily="ui-monospace,SFMono-Regular,Menlo,monospace"
        >
          * 481920847291 *
        </text>

        {/* Right Info Cards */}
        <rect x="232" y="58" width="126" height="52" rx="4" fill="#f8f6f0" stroke="#e5ded3" strokeWidth="1" />
        <text
          x="242"
          y="74"
          fill="#78716c"
          fontSize="8"
          fontFamily="ui-monospace,SFMono-Regular,Menlo,monospace"
          fontWeight="600"
        >
          SCHEMA VALIDITY
        </text>
        <text
          x="242"
          y="95"
          fill="#15803d"
          fontSize="16"
          fontWeight="800"
          fontFamily="ui-monospace,SFMono-Regular,Menlo,monospace"
        >
          100%
        </text>
        <text x="286" y="94" fill="#78716c" fontSize="8" fontFamily="ui-monospace,SFMono-Regular,Menlo,monospace">
          (0 errors)
        </text>

        <rect x="232" y="118" width="126" height="52" rx="4" fill="#f8f6f0" stroke="#e5ded3" strokeWidth="1" />
        <text
          x="242"
          y="134"
          fill="#78716c"
          fontSize="8"
          fontFamily="ui-monospace,SFMono-Regular,Menlo,monospace"
          fontWeight="600"
        >
          LINE-ITEM F1
        </text>
        <text
          x="242"
          y="155"
          fill="#c2410c"
          fontSize="16"
          fontWeight="800"
          fontFamily="ui-monospace,SFMono-Regular,Menlo,monospace"
        >
          1.00
        </text>
        <text x="280" y="154" fill="#ea580c" fontSize="8" fontFamily="ui-monospace,SFMono-Regular,Menlo,monospace">
          +62.8% base
        </text>

        <rect x="232" y="178" width="126" height="52" rx="4" fill="#f8f6f0" stroke="#e5ded3" strokeWidth="1" />
        <text
          x="242"
          y="194"
          fill="#78716c"
          fontSize="8"
          fontFamily="ui-monospace,SFMono-Regular,Menlo,monospace"
          fontWeight="600"
        >
          INFERENCE FORMAT
        </text>
        <text
          x="242"
          y="214"
          fill="#1c1917"
          fontSize="12"
          fontWeight="700"
          fontFamily="ui-monospace,SFMono-Regular,Menlo,monospace"
        >
          GGUF Q4_K_M
        </text>

        <rect x="232" y="238" width="126" height="56" rx="4" fill="#f8f6f0" stroke="#e5ded3" strokeWidth="1" />
        <text
          x="242"
          y="254"
          fill="#78716c"
          fontSize="8"
          fontFamily="ui-monospace,SFMono-Regular,Menlo,monospace"
          fontWeight="600"
        >
          PIPELINE CHECK
        </text>
        <circle cx="248" cy="272" r="3.5" fill="#16a34a" />
        <text
          x="258"
          y="275"
          fill="#1c1917"
          fontSize="9"
          fontWeight="600"
          fontFamily="ui-monospace,SFMono-Regular,Menlo,monospace"
        >
          Pydantic Strict
        </text>
      </g>
    </svg>
  );
}
