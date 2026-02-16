import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Star, Eye } from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';
import { useCoins } from '../hooks/useCoins';
import PriceChange from '../components/PriceChange';
import SparklineChart from '../components/SparklineChart';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatPrice, formatCurrency } from '../components/FormatNumber';

export default function Watchlist() {
  const { watchlist, toggle } = useWatchlist();
  const { coins, loading } = useCoins();

  const watched = useMemo(
    () => coins.filter(c => watchlist.includes(c.id)),
    [coins, watchlist]
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Eye className="w-6 h-6" /> Watchlist
      </h1>

      {watched.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-dark-muted border border-gray-200 dark:border-dark-border rounded-xl">
          <Star className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="mb-2">Your watchlist is empty</p>
          <Link to="/" className="text-gain hover:underline text-sm">Browse coins and click the star to add</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {watched.map(coin => (
            <div key={coin.id} className="rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <Link to={`/coin/${coin.id}`} className="flex items-center gap-2 hover:underline">
                  <img src={coin.image} alt="" className="w-8 h-8 rounded-full" />
                  <div>
                    <div className="font-semibold">{coin.name}</div>
                    <div className="text-xs text-gray-400 uppercase">{coin.symbol}</div>
                  </div>
                </Link>
                <button onClick={() => toggle(coin.id)} className="text-yellow-400 hover:text-yellow-500">
                  <Star className="w-5 h-5 fill-yellow-400" />
                </button>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-xl font-bold">{formatPrice(coin.current_price)}</div>
                  <PriceChange value={coin.price_change_percentage_24h} />
                </div>
                <div className="w-24 h-10">
                  {coin.sparkline_in_7d && (
                    <SparklineChart data={coin.sparkline_in_7d.price} positive={(coin.price_change_percentage_7d_in_currency ?? 0) >= 0} />
                  )}
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-dark-border flex justify-between text-xs text-gray-500 dark:text-dark-muted">
                <span>MCap: {formatCurrency(coin.market_cap)}</span>
                <span>Vol: {formatCurrency(coin.total_volume)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
