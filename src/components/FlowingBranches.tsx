/**
 * FlowingBranches Component
 *
 * Subtle SVG flowing lines that guide the eye downward
 * Inspired by tree branches, water flow, gentle wind
 */

import './FlowingBranches.css';

export const FlowingBranches = (): JSX.Element => {
  return (
    <svg
      className="flowing-branches"
      viewBox="0 0 400 1200"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="branchGradient1" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="var(--moss-300)" stopOpacity="0" />
          <stop offset="30%" stopColor="var(--moss-300)" stopOpacity="0.5" />
          <stop offset="60%" stopColor="var(--river-300)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="var(--river-300)" stopOpacity="0" />
        </linearGradient>

        <linearGradient id="branchGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="var(--moss-200)" stopOpacity="0" />
          <stop offset="40%" stopColor="var(--moss-200)" stopOpacity="0.3" />
          <stop offset="70%" stopColor="var(--river-200)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Main flowing line - slightly curved */}
      <path
        className="branch-main"
        d="M 200 0
           Q 180 150 200 300
           Q 220 450 200 600
           Q 180 750 200 900
           Q 210 1050 200 1200"
        fill="none"
        stroke="url(#branchGradient1)"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Secondary flowing line - more subtle */}
      <path
        className="branch-secondary"
        d="M 220 100
           Q 240 200 220 350
           Q 200 500 220 650
           Q 230 800 220 950"
        fill="none"
        stroke="url(#branchGradient2)"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />

      {/* Tertiary line - very subtle */}
      <path
        className="branch-tertiary"
        d="M 180 150
           Q 160 250 180 400
           Q 190 550 180 700
           Q 175 850 180 1000"
        fill="none"
        stroke="url(#branchGradient2)"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.4"
      />

      {/* Subtle organic dots along the path */}
      <circle className="branch-dot" cx="200" cy="250" r="3" fill="var(--moss-400)" opacity="0.25" />
      <circle className="branch-dot" cx="210" cy="500" r="2.5" fill="var(--river-400)" opacity="0.2" />
      <circle className="branch-dot" cx="195" cy="750" r="3.5" fill="var(--moss-300)" opacity="0.18" />
    </svg>
  );
};
