/**
 * TreeOfLife Component
 *
 * Beautiful tree illustration with roots and foliage.
 * Symbolizes growth, grounding, and the natural journey of habit formation.
 */

import './TreeOfLife.css';

export const TreeOfLife = (): JSX.Element => {
  return (
    <div className="tree-of-life-container" aria-hidden="true">
      <img
        src="/tree-of-life.png"
        alt=""
        className="tree-of-life-image"
      />
    </div>
  );
};
