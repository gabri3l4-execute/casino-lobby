import React, { useState, useCallback } from "react";
import "./GameCard.css";
import type { Game } from "../types/lobby";

interface Props {
  game: Game;
  imageHeight?: number;
  index?: number; // used for LCP optimizations above the fold
  isAboveTheFold?: boolean;
}

const GameCardInner: React.FC<Props> = ({
  game,
  imageHeight = 120,
  index = 0,
  isAboveTheFold,
}) => {
  const rawSrc = game.imageUrl || game.image || "";

  // Ensure we don't trigger a network error or broken request
  const initialSrc = rawSrc && !rawSrc.startsWith("blob:null") ? rawSrc : "";

  const [status, setStatus] = useState<"loading" | "loaded" | "error">(
    initialSrc ? "loading" : "error"
  );

  const handleLoad = useCallback(() => setStatus("loaded"), []);
  const handleError = useCallback(() => setStatus("error"), []);

  const showPlaceholder = status !== "loaded";
  const placeholderText = game.name || "No image";

  // Decide whether this image should be treated as "above the fold".
  // Parent can override via `isAboveTheFold`; otherwise we fall back to index-based heuristic.
  const derivedIsAboveTheFold =
    typeof isAboveTheFold === "boolean" ? isAboveTheFold : index < 8;

  // Treat the very first couple of images as the true LCP/priority images.
  const isPriorityImage = derivedIsAboveTheFold && index < 2;

  const style = {
    "--game-image-height": `${imageHeight}px`,
  } as React.CSSProperties;

  return (
    <div className="game-card">
      <div
        className="game-image-wrap"
        style={style}
        aria-hidden={!showPlaceholder}
      >
        {initialSrc && status !== "error" && (
          <img
            className={`game-image ${status === "loaded" ? "loaded" : ""} ${
              isPriorityImage ? "lcp" : ""
            }`}
            src={initialSrc}
            alt={game.name || "Game image"}
            // Reserve space via CSS + inline style so the browser can layout early
            // and paint the image as soon as it's available.
            height={imageHeight}
            style={{ width: "100%", height: `${imageHeight}px` }}
            loading={isPriorityImage ? "eager" : "lazy"}
            // Let the browser choose a decode strategy for priority images (avoid sync decode),
            // and request async decoding for non-priority images to avoid blocking.
            decoding={isPriorityImage ? undefined : "async"}
            fetchPriority={isPriorityImage ? "high" : "low"}
            onLoad={handleLoad}
            onError={handleError}
          />
        )}

        {/* For priority/LCP images we avoid rendering the placeholder overlay so the
            img can paint without being visually occluded. Non-priority images still
            show a placeholder to avoid layout shifts. */}
        {showPlaceholder && !isPriorityImage && (
          <div
            className="game-image-placeholder"
            role="img"
            aria-label={placeholderText}
          >
            <span>{placeholderText}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Prevents re-renders during virtualization unless real data changes
export default React.memo(GameCardInner, (prev, next) => {
  return (
    prev.game.id === next.game.id &&
    prev.game.imageUrl === next.game.imageUrl &&
    prev.index === next.index &&
    prev.isAboveTheFold === next.isAboveTheFold &&
    prev.imageHeight === next.imageHeight
  );
});
