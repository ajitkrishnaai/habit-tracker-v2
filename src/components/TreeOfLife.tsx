/**
 * TreeOfLife Component
 *
 * Watercolor-style tree illustration with overlapping circles creating organic foliage.
 * Inspired by botanical art - calm, natural, and on-brand for Amara.day.
 */

import './TreeOfLife.css';

export const TreeOfLife = (): JSX.Element => {
  return (
    <div className="tree-of-life-container" aria-hidden="true">
      <svg
        className="tree-of-life-svg"
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Trunk - solid dark brown base */}
        <path
          d="M 100 200 L 95 140 Q 95 120, 98 100 L 100 60"
          fill="#4a3728"
          className="tree-trunk"
        />

        {/* Main branches - spreading from trunk */}
        <g className="tree-branches">
          {/* Center upward branch */}
          <line x1="100" y1="80" x2="100" y2="30" stroke="#5a4438" strokeWidth="3" strokeLinecap="round" />

          {/* Left side branches */}
          <line x1="98" y1="75" x2="70" y2="45" stroke="#5a4438" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="96" y1="85" x2="55" y2="65" stroke="#5a4438" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="95" y1="95" x2="40" y2="85" stroke="#5a4438" strokeWidth="2" strokeLinecap="round" />

          {/* Right side branches */}
          <line x1="102" y1="75" x2="130" y2="45" stroke="#5a4438" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="104" y1="85" x2="145" y2="65" stroke="#5a4438" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="105" y1="95" x2="160" y2="85" stroke="#5a4438" strokeWidth="2" strokeLinecap="round" />

          {/* Secondary smaller branches */}
          <line x1="70" y1="45" x2="60" y2="35" stroke="#5a4438" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="130" y1="45" x2="140" y2="35" stroke="#5a4438" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        {/* Watercolor foliage - overlapping circles in various greens */}
        <g className="tree-foliage">
          {/* Layer 1: Dark greens (background) */}
          <circle cx="100" cy="50" r="14" fill="#2d7a5f" opacity="0.5" />
          <circle cx="70" cy="60" r="12" fill="#2d7a5f" opacity="0.5" />
          <circle cx="130" cy="55" r="13" fill="#2d8a6f" opacity="0.5" />
          <circle cx="85" cy="70" r="11" fill="#2d7a5f" opacity="0.5" />
          <circle cx="115" cy="68" r="12" fill="#2d8a6f" opacity="0.5" />

          {/* Layer 2: Medium greens */}
          <circle cx="95" cy="35" r="10" fill="#5cb85c" opacity="0.6" />
          <circle cx="105" cy="38" r="11" fill="#52a352" opacity="0.6" />
          <circle cx="75" cy="48" r="13" fill="#5cb85c" opacity="0.6" />
          <circle cx="125" cy="47" r="12" fill="#52a352" opacity="0.6" />
          <circle cx="90" cy="55" r="14" fill="#5cb85c" opacity="0.6" />
          <circle cx="110" cy="53" r="13" fill="#52a352" opacity="0.6" />
          <circle cx="60" cy="65" r="11" fill="#5cb85c" opacity="0.6" />
          <circle cx="140" cy="63" r="12" fill="#52a352" opacity="0.6" />
          <circle cx="80" cy="80" r="10" fill="#5cb85c" opacity="0.6" />
          <circle cx="120" cy="78" r="11" fill="#52a352" opacity="0.6" />

          {/* Layer 3: Bright lime greens */}
          <circle cx="88" cy="30" r="8" fill="#a8d08d" opacity="0.65" />
          <circle cx="112" cy="32" r="9" fill="#b8e0a8" opacity="0.65" />
          <circle cx="68" cy="42" r="10" fill="#a8d08d" opacity="0.65" />
          <circle cx="132" cy="40" r="9" fill="#b8e0a8" opacity="0.65" />
          <circle cx="78" cy="52" r="11" fill="#a8d08d" opacity="0.65" />
          <circle cx="122" cy="50" r="10" fill="#b8e0a8" opacity="0.65" />
          <circle cx="92" cy="62" r="12" fill="#a8d08d" opacity="0.65" />
          <circle cx="108" cy="60" r="11" fill="#b8e0a8" opacity="0.65" />
          <circle cx="55" cy="70" r="9" fill="#a8d08d" opacity="0.65" />
          <circle cx="145" cy="68" r="10" fill="#b8e0a8" opacity="0.65" />
          <circle cx="70" cy="82" r="8" fill="#a8d08d" opacity="0.65" />
          <circle cx="130" cy="80" r="9" fill="#b8e0a8" opacity="0.65" />

          {/* Layer 4: Teal/turquoise accents */}
          <circle cx="82" cy="38" r="7" fill="#4ca89a" opacity="0.6" />
          <circle cx="118" cy="40" r="8" fill="#5cb8aa" opacity="0.6" />
          <circle cx="65" cy="55" r="9" fill="#4ca89a" opacity="0.6" />
          <circle cx="135" cy="53" r="8" fill="#5cb8aa" opacity="0.6" />
          <circle cx="98" cy="68" r="10" fill="#4ca89a" opacity="0.6" />
          <circle cx="102" cy="70" r="9" fill="#5cb8aa" opacity="0.6" />
          <circle cx="48" cy="78" r="7" fill="#4ca89a" opacity="0.6" />
          <circle cx="152" cy="76" r="8" fill="#5cb8aa" opacity="0.6" />

          {/* Layer 5: Light highlights (top layer) */}
          <circle cx="100" cy="28" r="6" fill="#d4e8a8" opacity="0.7" />
          <circle cx="73" cy="35" r="7" fill="#d4e8a8" opacity="0.7" />
          <circle cx="127" cy="33" r="6" fill="#d4e8a8" opacity="0.7" />
          <circle cx="85" cy="45" r="8" fill="#d4e8a8" opacity="0.7" />
          <circle cx="115" cy="43" r="7" fill="#d4e8a8" opacity="0.7" />
          <circle cx="62" cy="58" r="6" fill="#d4e8a8" opacity="0.7" />
          <circle cx="138" cy="56" r="7" fill="#d4e8a8" opacity="0.7" />
          <circle cx="95" cy="75" r="6" fill="#d4e8a8" opacity="0.7" />
          <circle cx="105" cy="73" r="6" fill="#d4e8a8" opacity="0.7" />

          {/* Additional small accent circles for density */}
          <circle cx="90" cy="42" r="5" fill="#52a352" opacity="0.5" />
          <circle cx="110" cy="44" r="5" fill="#5cb85c" opacity="0.5" />
          <circle cx="76" cy="62" r="6" fill="#4ca89a" opacity="0.5" />
          <circle cx="124" cy="60" r="6" fill="#5cb8aa" opacity="0.5" />
          <circle cx="58" cy="73" r="5" fill="#a8d08d" opacity="0.5" />
          <circle cx="142" cy="71" r="5" fill="#b8e0a8" opacity="0.5" />
        </g>
      </svg>
    </div>
  );
};
