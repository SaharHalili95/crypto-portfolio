import { createContext, useContext, useState, type ReactNode } from 'react';

interface WatchlistContextType {
  watchlist: string[];
  toggle: (id: string) => void;
  isWatched: (id: string) => boolean;
}

const WatchlistContext = createContext<WatchlistContextType | null>(null);

function load(): string[] {
  try {
    const saved = localStorage.getItem('crypto-watchlist');
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return [];
}

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const [watchlist, setWatchlist] = useState<string[]>(load);

  const toggle = (id: string) => {
    setWatchlist(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem('crypto-watchlist', JSON.stringify(next));
      return next;
    });
  };

  const isWatched = (id: string) => watchlist.includes(id);

  return (
    <WatchlistContext.Provider value={{ watchlist, toggle, isWatched }}>
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const ctx = useContext(WatchlistContext);
  if (!ctx) throw new Error('useWatchlist must be used within WatchlistProvider');
  return ctx;
}
