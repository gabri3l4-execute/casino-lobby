import React, { useRef, useState, useLayoutEffect } from "react";
import type { CSSProperties, ReactElement } from "react";
import "./GameGrid.css";
import type { Game, Studio } from "../types/lobby";
import GameCard from "./GameCard";
import GameCount from "./GameCount";
import { List } from "react-window";

interface Props {
  games: Game[];
  studios: Studio[];
  loading: boolean;
  error: string | null;
}
interface RowExtraProps {
  games: Game[];
  studios: Studio[];
  columnCount: number;
  columnWidth: number;
  gap: number;
  aboveFoldCount: number;
}

type RowProps = RowExtraProps & {
  index: number;
  style: CSSProperties;
  ariaAttributes: {
    "aria-posinset": number;
    "aria-setsize": number;
    role: "listitem";
  };
};

// Row component for react-window v2 List. Receives index, style and any rowProps.
function Row({
  index,
  style,
  games,
  columnCount,
  columnWidth,
  gap,
  aboveFoldCount,
  ariaAttributes,
}: RowProps): ReactElement {
  const start = index * columnCount;

  const rowStyle: React.CSSProperties = {
    ...style,
    display: "flex",
    boxSizing: "border-box",
    gap: `${gap}px`,
    alignItems: "stretch",
    width: "100%",
  };

  const cells = new Array(columnCount).fill(null).map((_, colIndex) => {
    const gameIndex = start + colIndex;
    const key = `cell-${index}-${colIndex}`;
    const cellStyle: React.CSSProperties = {
      flex: `0 0 ${columnWidth}px`,
      height: "100%",
      boxSizing: "border-box",
    };

    if (gameIndex >= games.length) {
      return <div key={key} style={cellStyle} />;
    }

    const g = games[gameIndex];
    const isAbove = gameIndex < aboveFoldCount;

    return (
      <div key={key} style={cellStyle} role="listitem">
        <GameCard
          game={g}
          imageHeight={160}
          index={gameIndex}
          isAboveTheFold={isAbove}
        />
      </div>
    );
  });

  return (
    <div style={rowStyle} {...ariaAttributes}>
      {cells}
    </div>
  );
}

const GameGrid: React.FC<Props> = ({ games, studios, loading, error }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(1280);
  const [containerHeight, setContainerHeight] = useState<number>(600);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      setContainerWidth(Math.floor(el.getBoundingClientRect().width));
      setContainerHeight(
        Math.floor(
          el.getBoundingClientRect().height || window.innerHeight - 200
        )
      );
    };

    updateSize();

    const ro = new ResizeObserver(() => updateSize());
    ro.observe(el);

    return () => ro.disconnect();
  }, []);

  if (loading) return <div>Loading games…</div>;
  if (error) return <div>Error loading games: {error}</div>;

  if (!loading && !error && games.length === 0) {
    return <div>No games match the selected filters.</div>;
  }

  const minColumnWidth = 220;
  const gap = 16;
  const columnCount = Math.max(
    1,
    Math.floor(containerWidth / (minColumnWidth + gap))
  );
  const columnWidth = Math.floor(
    (containerWidth - gap * (columnCount - 1)) / columnCount
  );
  const rowCount = Math.ceil(games.length / columnCount);

  // image + meta + gap. Keep imageHeight fixed at 120px per requirement.
  const imageHeight = 160;
  const rowHeight = Math.ceil(imageHeight + gap);
  // how many items (cards) are above the fold / initially visible
  const visibleRows = Math.max(1, Math.ceil(containerHeight / rowHeight));
  const aboveFoldCount = visibleRows * columnCount;

  return (
    <div>
      <div className="game-grid-header">
        <GameCount count={games.length} />
      </div>

      <div
        ref={containerRef}
        className="game-grid-virtual"
        role="list"
        aria-label="games"
      >
        <List
          rowCount={rowCount}
          rowHeight={rowHeight}
          rowComponent={Row}
          rowProps={
            {
              games,
              studios,
              columnCount,
              columnWidth,
              gap,
              aboveFoldCount,
            } satisfies RowExtraProps
          }
        />
      </div>
    </div>
  );
};

export default React.memo(GameGrid);
