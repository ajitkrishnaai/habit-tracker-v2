/**
 * BotanicalCorners Component
 *
 * Delicate watercolor-style botanical illustrations
 * Fresh green leaves with natural, flowing branches
 */

import './BotanicalCorners.css';

export const BotanicalCorners = (): JSX.Element => {
  return (
    <>
      {/* Top-right corner botanical */}
      <svg
        className="botanical-corner botanical-top-right"
        viewBox="0 0 280 260"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMaxYMin meet"
        aria-hidden="true"
      >
        {/* Organic, curved branches - flowing naturally */}
        <path
          d="M 275 8 C 260 15, 245 28, 230 45 C 215 62, 200 82, 185 105 C 170 128, 155 152, 140 178"
          stroke="#92B083"
          strokeWidth="1.8"
          fill="none"
          opacity="0.20"
        />
        <path
          d="M 270 22 C 255 32, 240 47, 225 65 C 210 83, 195 103, 180 125"
          stroke="#A8C498"
          strokeWidth="1.4"
          fill="none"
          opacity="0.18"
        />

        {/* Far corner - delicate leaves, FRESH GREENS */}
        <ellipse cx="273" cy="12" rx="7" ry="12" fill="#85C47E" opacity="0.26" transform="rotate(-50 273 12)" />
        <ellipse cx="268" cy="24" rx="6" ry="11" fill="#9DD696" opacity="0.24" transform="rotate(45 268 24)" />

        {/* First branch cluster - well separated */}
        <ellipse cx="245" cy="38" rx="7" ry="12" fill="#72B66D" opacity="0.25" transform="rotate(-65 245 38)" />
        <ellipse cx="252" cy="48" rx="6" ry="10" fill="#A8D8A1" opacity="0.23" transform="rotate(30 252 48)" />

        {/* Second branch cluster - natural spacing */}
        <ellipse cx="220" cy="62" rx="6" ry="11" fill="#85C47E" opacity="0.24" transform="rotate(75 220 62)" />
        <ellipse cx="228" cy="75" rx="7" ry="12" fill="#9DD696" opacity="0.22" transform="rotate(-40 228 75)" />

        {/* Third cluster - flowing downward */}
        <ellipse cx="195" cy="95" rx="6" ry="10" fill="#72B66D" opacity="0.23" transform="rotate(-80 195 95)" />
        <ellipse cx="203" cy="108" rx="5" ry="9" fill="#A8D8A1" opacity="0.21" transform="rotate(55 203 108)" />

        {/* Trailing leaves - sparse, delicate */}
        <ellipse cx="168" cy="132" rx="5" ry="9" fill="#85C47E" opacity="0.20" transform="rotate(-30 168 132)" />
        <ellipse cx="152" cy="155" rx="5" ry="8" fill="#9DD696" opacity="0.18" transform="rotate(60 152 155)" />

        {/* Subtle golden/sand accent */}
        <ellipse cx="258" cy="52" rx="5" ry="8" fill="#E8DCC8" opacity="0.18" transform="rotate(-70 258 52)" />
        <ellipse cx="212" cy="88" rx="4" ry="7" fill="#DDD1BA" opacity="0.16" transform="rotate(40 212 88)" />
      </svg>

      {/* Bottom-left corner botanical */}
      <svg
        className="botanical-corner botanical-bottom-left"
        viewBox="0 0 280 260"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMinYMax meet"
        aria-hidden="true"
      >
        {/* Organic, curved branches - flowing naturally */}
        <path
          d="M 5 252 C 20 242, 35 228, 50 211 C 65 194, 80 175, 95 155 C 110 135, 125 115, 140 95"
          stroke="#92B083"
          strokeWidth="1.8"
          fill="none"
          opacity="0.20"
        />
        <path
          d="M 10 238 C 25 225, 40 210, 55 192 C 70 174, 85 155, 100 135"
          stroke="#A8C498"
          strokeWidth="1.4"
          fill="none"
          opacity="0.18"
        />

        {/* Far corner - delicate leaves, FRESH GREENS */}
        <ellipse cx="7" cy="248" rx="7" ry="12" fill="#85C47E" opacity="0.26" transform="rotate(50 7 248)" />
        <ellipse cx="12" cy="236" rx="6" ry="11" fill="#9DD696" opacity="0.24" transform="rotate(-45 12 236)" />

        {/* First branch cluster - well separated */}
        <ellipse cx="35" cy="222" rx="7" ry="12" fill="#72B66D" opacity="0.25" transform="rotate(65 35 222)" />
        <ellipse cx="28" cy="212" rx="6" ry="10" fill="#A8D8A1" opacity="0.23" transform="rotate(-30 28 212)" />

        {/* Second branch cluster - natural spacing */}
        <ellipse cx="60" cy="198" rx="6" ry="11" fill="#85C47E" opacity="0.24" transform="rotate(-75 60 198)" />
        <ellipse cx="52" cy="185" rx="7" ry="12" fill="#9DD696" opacity="0.22" transform="rotate(40 52 185)" />

        {/* Third cluster - flowing upward */}
        <ellipse cx="85" cy="165" rx="6" ry="10" fill="#72B66D" opacity="0.23" transform="rotate(80 85 165)" />
        <ellipse cx="77" cy="152" rx="5" ry="9" fill="#A8D8A1" opacity="0.21" transform="rotate(-55 77 152)" />

        {/* Trailing leaves - sparse, delicate */}
        <ellipse cx="112" cy="128" rx="5" ry="9" fill="#85C47E" opacity="0.20" transform="rotate(30 112 128)" />
        <ellipse cx="128" cy="105" rx="5" ry="8" fill="#9DD696" opacity="0.18" transform="rotate(-60 128 105)" />

        {/* Subtle golden/sand accent */}
        <ellipse cx="22" cy="208" rx="5" ry="8" fill="#E8DCC8" opacity="0.18" transform="rotate(70 22 208)" />
        <ellipse cx="68" cy="172" rx="4" ry="7" fill="#DDD1BA" opacity="0.16" transform="rotate(-40 68 172)" />
      </svg>
    </>
  );
};
