import React, { lazy, useCallback, useEffect } from 'react';
const Filters = lazy(() => import('./Filters'));
import GameGrid from './GameGrid';
import useLobbyData from '../hooks/useLobbyData';
import useDerivedLobbyData from '../hooks/useDerivedLobbyData';
import './Lobby.css';
import { usePersistentState } from '../hooks/usePersistentState';

const Lobby: React.FC = () => {
  const { games, studios, tags, currencyEntries, loading, error } = useLobbyData();

  // Fixed currency list for the dropdown and expected default
  const allowedCurrencies = ['EUR', 'USD', 'mBTC'];
  const [selectedCurrency, setSelectedCurrency] = usePersistentState<string>(
    'selectedCurrency',
    'EUR',
    { type: 'local', fallback: true }
  );
  const [selectedTagId, setSelectedTagId] = usePersistentState<number | null>(
    'selectedTagId',
    null,
    { type: 'local', fallback: true }
  );
  const [selectedStudioId, setSelectedStudioId] = usePersistentState<number | null>(
    'selectedStudioId',
    null,
    { type: 'local', fallback: true }
  );

  const handleCurrencyChange = useCallback((c: string) => setSelectedCurrency(c), [setSelectedCurrency]);
  const handleTagChange = useCallback((id: number | null) => setSelectedTagId(id), [setSelectedTagId]);
  const handleStudioChange = useCallback((id: number | null) => setSelectedStudioId(id), [setSelectedStudioId]);

  const selectedCurrencyEffective = selectedCurrency || 'EUR';

  const { visibleStudios, filteredGames } = useDerivedLobbyData({
    games,
    studios,
    currencyEntries,
    selectedTagId,
    selectedStudioId,
    selectedCurrencyEffective,
  });

  // If the selected studio is no longer in the visible list (due to category change), clear it
  useEffect(() => {
    if (selectedStudioId && !visibleStudios.some((s) => s.id === selectedStudioId)) {
      setSelectedStudioId(null);
    }
  }, [selectedStudioId, visibleStudios, setSelectedStudioId]);

  return (
    <div className="lobby-container">
      <Filters
        currencies={allowedCurrencies}
        selectedCurrency={selectedCurrencyEffective}
        onCurrencyChange={handleCurrencyChange}
        tags={tags}
        selectedTagId={selectedTagId}
        onTagChange={handleTagChange}
        studios={visibleStudios}
        selectedStudioId={selectedStudioId}
        onStudioChange={handleStudioChange}
      />
      <GameGrid
        games={filteredGames}
        studios={studios}
        loading={loading}
        error={error}
      />
    </div>
  );
};

export default Lobby;