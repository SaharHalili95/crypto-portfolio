import { useState, useEffect } from 'react';
import type { ChartData } from '../types';
import { getCoinChart } from '../services/api';

export function useCoinChart(id: string, days: number | string) {
  const [data, setData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetch = async () => {
      try {
        setLoading(true);
        const result = await getCoinChart(id, days);
        if (!cancelled) setData(result);
      } catch {
        // silently fail chart
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetch();
    return () => { cancelled = true; };
  }, [id, days]);

  return { data, loading };
}
