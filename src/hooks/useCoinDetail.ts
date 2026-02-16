import { useState, useEffect } from 'react';
import type { CoinDetail } from '../types';
import { getCoinDetail } from '../services/api';

export function useCoinDetail(id: string) {
  const [coin, setCoin] = useState<CoinDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const fetch = async () => {
      try {
        setLoading(true);
        const data = await getCoinDetail(id);
        if (!cancelled) { setCoin(data); setError(''); }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to fetch');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetch();
    return () => { cancelled = true; };
  }, [id]);

  return { coin, loading, error };
}
