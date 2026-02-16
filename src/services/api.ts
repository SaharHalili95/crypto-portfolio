import type { Coin, CoinDetail, ChartData } from '../types';

const BASE_URL = 'https://api.coingecko.com/api/v3';
const CACHE_DURATION = 60_000; // 60 seconds

const cache = new Map<string, { data: unknown; timestamp: number }>();

async function fetchWithCache<T>(url: string): Promise<T> {
  const cached = cache.get(url);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data as T;
  }

  const res = await fetch(url);
  if (res.status === 429) {
    throw new Error('Rate limited. Please wait a moment and try again.');
  }
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  const data = await res.json();
  cache.set(url, { data, timestamp: Date.now() });
  return data as T;
}

export async function getCoins(page = 1, perPage = 100): Promise<Coin[]> {
  return fetchWithCache<Coin[]>(
    `${BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=true&price_change_percentage=7d`
  );
}

export async function getCoinDetail(id: string): Promise<CoinDetail> {
  return fetchWithCache<CoinDetail>(
    `${BASE_URL}/coins/${id}?localization=false&tickers=false&community_data=false&developer_data=false`
  );
}

export async function getCoinChart(id: string, days: number | string): Promise<ChartData> {
  return fetchWithCache<ChartData>(
    `${BASE_URL}/coins/${id}/market_chart?vs_currency=usd&days=${days}`
  );
}

export async function searchCoins(query: string): Promise<{ coins: { id: string; name: string; symbol: string; thumb: string }[] }> {
  return fetchWithCache(
    `${BASE_URL}/search?query=${encodeURIComponent(query)}`
  );
}
