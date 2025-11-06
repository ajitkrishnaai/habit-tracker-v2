/**
 * LeafGrowth Animation Component
 *
 * Simple growth: visible green stem, leaves attached at nodes
 * Grows from small seedling to small tree
 */

import './LeafGrowth.css';

export const LeafGrowth = (): JSX.Element => {
  return (
    <div className="leaf-growth-container" aria-hidden="true">
      <svg
        className="leaf-growth-svg"
        viewBox="0 0 100 120"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Simple vertical stem - ALWAYS VISIBLE */}
        <line
          className="plant-stem"
          x1="50"
          y1="110"
          x2="50"
          y2="20"
          stroke="#6b9b6e"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Bottom pair - tiny starter leaves */}
        <ellipse
          className="leaf leaf-1-left"
          cx="42"
          cy="90"
          rx="4"
          ry="6"
          fill="#7fb77e"
          opacity="0.8"
        />
        <ellipse
          className="leaf leaf-1-right"
          cx="58"
          cy="90"
          rx="4"
          ry="6"
          fill="#7fb77e"
          opacity="0.8"
        />

        {/* Second pair - small leaves */}
        <ellipse
          className="leaf leaf-2-left"
          cx="40"
          cy="70"
          rx="5"
          ry="7"
          fill="#7fb77e"
          opacity="0.85"
        />
        <ellipse
          className="leaf leaf-2-right"
          cx="60"
          cy="70"
          rx="5"
          ry="7"
          fill="#7fb77e"
          opacity="0.85"
        />

        {/* Third pair - medium leaves */}
        <ellipse
          className="leaf leaf-3-left"
          cx="38"
          cy="50"
          rx="6"
          ry="8"
          fill="#7fb77e"
          opacity="0.9"
        />
        <ellipse
          className="leaf leaf-3-right"
          cx="62"
          cy="50"
          rx="6"
          ry="8"
          fill="#7fb77e"
          opacity="0.9"
        />

        {/* Top crown - larger leaves */}
        <ellipse
          className="leaf leaf-top-left"
          cx="42"
          cy="30"
          rx="7"
          ry="9"
          fill="#7fb77e"
        />
        <ellipse
          className="leaf leaf-top-right"
          cx="58"
          cy="30"
          rx="7"
          ry="9"
          fill="#7fb77e"
        />
        <ellipse
          className="leaf leaf-top-center"
          cx="50"
          cy="22"
          rx="8"
          ry="10"
          fill="#7fb77e"
        />
      </svg>
    </div>
  );
};
