import React from "react";
import type { Tag, Studio } from "../types/lobby";
import "./Filters.css";

interface Props {
  currencies: string[];
  selectedCurrency: string;
  onCurrencyChange: (c: string) => void;
  tags: Tag[];
  selectedTagId: number | null;
  onTagChange: (id: number | null) => void;
  studios: Studio[];
  selectedStudioId: number | null;
  onStudioChange: (id: number | null) => void;
}

const Filters: React.FC<Props> = ({
  currencies,
  selectedCurrency,
  onCurrencyChange,
  tags,
  selectedTagId,
  onTagChange,
  studios,
  selectedStudioId,
  onStudioChange,
}) => {
  return (
    <div className="controls-row">
      <div className="filters-left">
        <label>
          <select
            id="currency-select"
            name="currency-select"
            className="select"
            value={selectedCurrency}
            onChange={(e) => onCurrencyChange(e.target.value)}
            aria-label="Currency"
          >
            {currencies.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label>
          <select
            id="studio-select"
            name="studio-select"
            className="studio-select"
            value={selectedStudioId ?? ""}
            onChange={(e) =>
              onStudioChange(e.target.value ? Number(e.target.value) : null)
            }
          >
            <option value="">All Studios</option>
            {studios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      
        <div className="tag-list" role="list">
          <button
            className={`tag-btn ${selectedTagId === null ? "active" : ""}`}
            onClick={() => onTagChange(null)}
          >
            All
          </button>
          {tags.map((t) => (
            <button
              key={t.id}
              className={`tag-btn ${selectedTagId === t.id ? "active" : ""}`}
              onClick={() => onTagChange(t.id)}
              title={t.name}
            >
              {t.name}
            </button>
          ))}
        </div>
    </div>
  );
};

export default Filters;
