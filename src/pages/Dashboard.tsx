import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronUp, ChevronDown, Star } from 'lucide-react';
import { useCoins } from '../hooks/useCoins';
import { useWatchlist } from '../context/WatchlistContext';
import SparklineChart from '../components/SparklineChart';
import PriceChange from '../components/PriceChange';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatCurrency, formatPrice } from '../components/FormatNumber';
import type { SortField, SortDirection } from '../types';

export default function Dashboard() {
  const { coins, loading, error } = useCoins();
  const { toggle, isWatched } = useWatchlist();
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('market_cap_rank');
  const [sortDir, setSortDir] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir(field === 'market_cap_rank' ? 'asc' : 'desc'); }
  };

  const filtered = useMemo(() => {
    let list = coins;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q));
    }
    return [...list].sort((a, b) => {
      const av = a[sortField] ?? 0;
      const bv = b[sortField] ?? 0;
      return sortDir === 'asc' ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
  }, [coins, search, sortField, sortDir]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronUp className="w-3 h-3 opacity-0 group-hover:opacity-30" />;
    return sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />;
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-center py-20 text-loss">{error}</div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Top 100 Cryptocurrencies</h1>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Filter coins..."
          className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card focus:outline-none focus:ring-2 focus:ring-gain/50 w-full sm:w-64"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-dark-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-dark-card text-left">
              <th className="px-3 py-3 w-10"></th>
              <th className="px-3 py-3 cursor-pointer group" onClick={() => handleSort('market_cap_rank')}>
                <span className="inline-flex items-center gap-1"># <SortIcon field="market_cap_rank" /></span>
              </th>
              <th className="px-3 py-3">Coin</th>
              <th className="px-3 py-3 cursor-pointer group text-right" onClick={() => handleSort('current_price')}>
                <span className="inline-flex items-center gap-1 justify-end">Price <SortIcon field="current_price" /></span>
              </th>
              <th className="px-3 py-3 cursor-pointer group text-right" onClick={() => handleSort('price_change_percentage_24h')}>
                <span className="inline-flex items-center gap-1 justify-end">24h <SortIcon field="price_change_percentage_24h" /></span>
              </th>
              <th className="px-3 py-3 cursor-pointer group text-right hidden md:table-cell" onClick={() => handleSort('price_change_percentage_7d_in_currency')}>
                <span className="inline-flex items-center gap-1 justify-end">7d <SortIcon field="price_change_percentage_7d_in_currency" /></span>
              </th>
              <th className="px-3 py-3 cursor-pointer group text-right hidden lg:table-cell" onClick={() => handleSort('market_cap')}>
                <span className="inline-flex items-center gap-1 justify-end">Market Cap <SortIcon field="market_cap" /></span>
              </th>
              <th className="px-3 py-3 cursor-pointer group text-right hidden lg:table-cell" onClick={() => handleSort('total_volume')}>
                <span className="inline-flex items-center gap-1 justify-end">Volume <SortIcon field="total_volume" /></span>
              </th>
              <th className="px-3 py-3 text-right hidden xl:table-cell w-32">7d Chart</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
            {filtered.map(coin => (
              <tr key={coin.id} className="hover:bg-gray-50 dark:hover:bg-dark-card/50 transition-colors">
                <td className="px-3 py-3">
                  <button onClick={() => toggle(coin.id)} className="text-gray-300 dark:text-gray-600 hover:text-yellow-400 transition-colors">
                    <Star className={`w-4 h-4 ${isWatched(coin.id) ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                  </button>
                </td>
                <td className="px-3 py-3 text-gray-500 dark:text-dark-muted">{coin.market_cap_rank}</td>
                <td className="px-3 py-3">
                  <Link to={`/coin/${coin.id}`} className="flex items-center gap-2 hover:underline">
                    <img src={coin.image} alt="" className="w-6 h-6 rounded-full" />
                    <span className="font-medium">{coin.name}</span>
                    <span className="text-gray-400 uppercase text-xs">{coin.symbol}</span>
                  </Link>
                </td>
                <td className="px-3 py-3 text-right font-medium">{formatPrice(coin.current_price)}</td>
                <td className="px-3 py-3 text-right"><PriceChange value={coin.price_change_percentage_24h} /></td>
                <td className="px-3 py-3 text-right hidden md:table-cell"><PriceChange value={coin.price_change_percentage_7d_in_currency} /></td>
                <td className="px-3 py-3 text-right hidden lg:table-cell text-gray-600 dark:text-dark-muted">{formatCurrency(coin.market_cap)}</td>
                <td className="px-3 py-3 text-right hidden lg:table-cell text-gray-600 dark:text-dark-muted">{formatCurrency(coin.total_volume)}</td>
                <td className="px-3 py-3 hidden xl:table-cell">
                  {coin.sparkline_in_7d && (
                    <SparklineChart
                      data={coin.sparkline_in_7d.price}
                      positive={(coin.price_change_percentage_7d_in_currency ?? 0) >= 0}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
