import React from 'react';
import './CategoryBar.css';

interface CategoryBarProps {
  tags: { id: number; name: string }[];
  selectedTagId: number | null;
  onTagChange: (id: number | null) => void;
}

const CategoryBar: React.FC<CategoryBarProps> = ({ tags, selectedTagId, onTagChange }) => {
  const sortedTags = [{ id: -1, name: 'All' }, ...tags.sort((a, b) => a.name.localeCompare(b.name))];

  return (
    <div className="category-bar">
      <div className="category-scroll">
        {sortedTags.map(tag => (
          <button
            key={tag.id}
            className={`category-chip ${selectedTagId === tag.id || (tag.id === -1 && selectedTagId === null) ? 'selected' : ''}`}
            onClick={() => onTagChange(tag.id === -1 ? null : tag.id)}
          >
            {tag.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryBar;