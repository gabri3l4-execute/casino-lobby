import React, { useRef, useState, useLayoutEffect } from "react";
import "./GameGrid.css";
import type { Game, Studio } from "../types/lobby";
import GameCard from "./GameCard";
import { List } from "react-window";

interface Props {
  games: Game[];
  studios: Studio[];
  loading: boolean;
  error: string | null;
}

// Row component for react-window v2 List. Receives index, style and any rowProps.
const Row = ({ index, style, ...rowProps }: any) => {
  const { games, studios, columnCount, columnWidth, gap } = rowProps;
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

    if (gameIndex >= games.length) return <div key={key} style={cellStyle} />;

    const g = games[gameIndex];
    const studio = studios.find((s: Studio) => s.id === g.studioId);
    const isAbove = typeof rowProps.aboveFoldCount === 'number' ? gameIndex < rowProps.aboveFoldCount : gameIndex < 8;

    return (
      <div key={key} style={cellStyle} role="listitem">
        <GameCard game={g} studio={studio} imageHeight={120} index={gameIndex} isAboveTheFold={isAbove} />
      </div>
    );
  });

  return <div style={rowStyle}>{cells}</div>;
};

const GameGrid: React.FC<Props> = ({ games, studios, loading, error }) => {
  if (loading) return <div>Loading games…</div>;
  if (error) return <div>Error loading games: {error}</div>;

  if (!loading && !error && games.length === 0) {
    return <div>No games match the selected filters.</div>;
  }

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(1280);
  const [containerHeight, setContainerHeight] = useState<number>(600);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    setContainerWidth(Math.floor(el.getBoundingClientRect().width));
    setContainerHeight(Math.floor(el.getBoundingClientRect().height || window.innerHeight - 200));
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        setContainerWidth(Math.floor(e.contentRect.width));
        setContainerHeight(Math.floor(e.contentRect.height || window.innerHeight - 200));
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const minColumnWidth = 220;
  const gap = 16;
  const columnCount = Math.max(1, Math.floor(containerWidth / (minColumnWidth + gap)));
  const columnWidth = Math.floor((containerWidth - gap * (columnCount - 1)) / columnCount);
  const rowCount = Math.ceil(games.length / columnCount);

  // image + meta + gap. Keep imageHeight fixed at 120px per requirement.
  const imageHeight = 120;
  const metaHeight = 44; // approximate height for name + studio + padding
  const rowHeight = Math.ceil(imageHeight + metaHeight + gap);
  // how many items (cards) are above the fold / initially visible
  const visibleRows = Math.max(1, Math.ceil(containerHeight / rowHeight));
  const aboveFoldCount = visibleRows * columnCount;

  return (
    <div>
      <div className="game-grid-header">
        <span className="game-count">Showing {games.length} game{games.length !== 1 ? 's' : ''}</span>
      </div>

      <div ref={containerRef} className="game-grid-virtual" role="list" aria-label="games">
        <List
          rowCount={rowCount}
          rowHeight={rowHeight}
          rowComponent={Row}
          rowProps={{ games, studios, columnCount, columnWidth, gap, aboveFoldCount }}
        />
      </div>
    </div>
  );
};

export default React.memo(GameGrid);
