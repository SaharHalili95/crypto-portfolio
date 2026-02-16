import { useState, useEffect } from 'react';
import type { Coin } from '../types';
import { getCoins } from '../services/api';

export function useCoins() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const fetchCoins = async () => {
      try {
        setLoading(true);
        const data = await getCoins();
        if (!cancelled) {
          setCoins(data);
          setError('');
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to fetch coins');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchCoins();
    const interval = setInterval(fetchCoins, 60_000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  return { coins, loading, error };
}
