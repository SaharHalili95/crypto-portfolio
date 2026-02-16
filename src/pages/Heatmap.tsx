import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCoins } from '../hooks/useCoins';
import LoadingSpinner from '../components/LoadingSpinner';

function getColor(pct: number): string {
  if (pct >= 10) return '#059669';
  if (pct >= 5) return '#10B981';
  if (pct >= 2) return '#34D399';
  if (pct >= 0) return '#6EE7B7';
  if (pct >= -2) return '#FCA5A5';
  if (pct >= -5) return '#EF4444';
  if (pct >= -10) return '#DC2626';
  return '#991B1B';
}

export default function Heatmap() {
  const { coins, loading, error } = useCoins();

  const sorted = useMemo(() =>
    [...coins].sort((a, b) => b.market_cap - a.market_cap).slice(0, 50),
  [coins]);

  const maxCap = sorted.length > 0 ? sorted[0].market_cap : 1;

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-center py-20 text-loss">{error}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Market Heatmap</h1>
      <p className="text-sm text-gray-500 dark:text-dark-muted mb-6">Block size represents market cap. Color represents 24h price change.</p>

      <div className="flex flex-wrap gap-1.5">
        {sorted.map(coin => {
          const pct = coin.price_change_percentage_24h ?? 0;
          const ratio = Math.sqrt(coin.market_cap / maxCap);
          const size = Math.max(60, Math.round(ratio * 180));

          return (
            <Link
              key={coin.id}
              to={`/coin/${coin.id}`}
              style={{
                width: size,
                height: size,
                backgroundColor: getColor(pct),
              }}
              className="rounded-lg flex flex-col items-center justify-center text-white hover:opacity-80 transition-opacity overflow-hidden p-1"
            >
              <img src={coin.image} alt="" className="w-5 h-5 rounded-full mb-0.5" />
              <span className="text-xs font-bold leading-tight">{coin.symbol.toUpperCase()}</span>
              <span className="text-[10px] font-medium leading-tight">
                {pct >= 0 ? '+' : ''}{pct.toFixed(1)}%
              </span>
            </Link>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-dark-muted">
        <span>-10%+</span>
        <div className="flex gap-0.5">
          {['#991B1B', '#DC2626', '#EF4444', '#FCA5A5', '#6EE7B7', '#34D399', '#10B981', '#059669'].map(c => (
            <div key={c} style={{ backgroundColor: c }} className="w-6 h-3 rounded-sm" />
          ))}
        </div>
        <span>+10%+</span>
      </div>
    </div>
  );
}
