import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCoins, getCoinDetail, getCoinChart, searchCoins, clearCache } from '../services/api';

const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
  clearCache();
});

describe('API Service', () => {
  describe('getCoins', () => {
    it('fetches top coins from CoinGecko', async () => {
      const mockCoins = [{ id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', current_price: 50000 }];
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve(mockCoins) });

      const result = await getCoins();
      expect(result).toEqual(mockCoins);
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/coins/markets'));
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('per_page=100'));
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('sparkline=true'));
    });

    it('throws on rate limit (429)', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 429 });
      await expect(getCoins()).rejects.toThrow('Rate limited');
    });

    it('throws on server error', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
      await expect(getCoins()).rejects.toThrow('API error: 500');
    });
  });

  describe('getCoinDetail', () => {
    it('fetches coin details', async () => {
      const mockDetail = { id: 'bitcoin', name: 'Bitcoin', market_data: {} };
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve(mockDetail) });

      const result = await getCoinDetail('bitcoin');
      expect(result).toEqual(mockDetail);
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/coins/bitcoin'));
    });
  });

  describe('getCoinChart', () => {
    it('fetches chart data for given days', async () => {
      const mockChart = { prices: [[1700000000000, 50000], [1700086400000, 51000]] };
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve(mockChart) });

      const result = await getCoinChart('bitcoin', 7);
      expect(result).toEqual(mockChart);
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('days=7'));
    });
  });

  describe('searchCoins', () => {
    it('searches coins by query', async () => {
      const mockSearch = { coins: [{ id: 'bitcoin', name: 'Bitcoin', symbol: 'btc', thumb: 'url' }] };
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve(mockSearch) });

      const result = await searchCoins('bit');
      expect(result.coins).toHaveLength(1);
      expect(result.coins[0].id).toBe('bitcoin');
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('search?query=bit'));
    });
  });

  describe('caching', () => {
    it('returns cached data on second call within 60s', async () => {
      const mockCoins = [{ id: 'ethereum' }];
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve(mockCoins) });

      const result1 = await getCoinChart('unique-cache-test', 30);
      const result2 = await getCoinChart('unique-cache-test', 30);

      expect(result1).toEqual(result2);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });
});
