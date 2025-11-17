import React from "react";

interface Props {
  count: number;
}

const GameCount: React.FC<Props> = ({ count }) => {
  return (
    <span className="game-count">
      Showing {count} game{count !== 1 ? "s" : ""}
    </span>
  );
};

export default GameCount;
