import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Star, ShoppingCart } from 'lucide-react';
import { useCoinDetail } from '../hooks/useCoinDetail';
import { useCoinChart } from '../hooks/useCoinChart';
import { useWatchlist } from '../context/WatchlistContext';
import { usePortfolio } from '../context/PortfolioContext';
import LoadingSpinner from '../components/LoadingSpinner';
import PriceChange from '../components/PriceChange';
import { formatCurrency, formatPrice, formatNumber } from '../components/FormatNumber';

const TIME_RANGES = [
  { label: '24h', days: 1 },
  { label: '7d', days: 7 },
  { label: '30d', days: 30 },
  { label: '1y', days: 365 },
];

export default function CoinDetail() {
  const { id } = useParams<{ id: string }>();
  const { coin, loading, error } = useCoinDetail(id!);
  const [range, setRange] = useState(7);
  const { data: chartData, loading: chartLoading } = useCoinChart(id!, range);
  const { toggle, isWatched } = useWatchlist();
  const portfolio = usePortfolio();
  const [buyQty, setBuyQty] = useState('');
  const [showBuy, setShowBuy] = useState(false);
  const [msg, setMsg] = useState('');

  if (loading) return <LoadingSpinner />;
  if (error || !coin) return <div className="text-center py-20 text-loss">{error || 'Coin not found'}</div>;

  const md = coin.market_data;
  const price = md.current_price.usd;

  const chartPoints = chartData?.prices.map(([ts, p]) => ({
    date: new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    price: p,
  })) ?? [];

  const priceUp = chartPoints.length > 1 && chartPoints[chartPoints.length - 1].price >= chartPoints[0].price;

  const handleBuy = () => {
    const qty = parseFloat(buyQty);
    if (!qty || qty <= 0) return;
    const ok = portfolio.buy(coin.id, coin.symbol, coin.name, coin.image.small, qty, price);
    setMsg(ok ? `Bought ${qty} ${coin.symbol.toUpperCase()}!` : 'Insufficient balance');
    setBuyQty('');
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-start gap-6 mb-8">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <img src={coin.image.large} alt="" className="w-12 h-12 rounded-full" />
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                {coin.name}
                <span className="text-sm text-gray-400 uppercase">{coin.symbol}</span>
                <span className="text-xs bg-gray-200 dark:bg-dark-card px-2 py-0.5 rounded">Rank #{coin.market_cap_rank}</span>
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-3xl font-bold">{formatPrice(price)}</span>
                <PriceChange value={md.price_change_percentage_24h} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <button onClick={() => toggle(coin.id)} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${isWatched(coin.id) ? 'border-yellow-400 text-yellow-400 bg-yellow-400/10' : 'border-gray-300 dark:border-dark-border text-gray-600 dark:text-dark-muted hover:border-yellow-400'}`}>
              <Star className={`w-4 h-4 ${isWatched(coin.id) ? 'fill-yellow-400' : ''}`} />
              {isWatched(coin.id) ? 'Watching' : 'Watchlist'}
            </button>
            <button onClick={() => setShowBuy(!showBuy)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium border border-gain text-gain hover:bg-gain/10 transition-colors">
              <ShoppingCart className="w-4 h-4" /> Buy
            </button>
          </div>

          {showBuy && (
            <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-gray-100 dark:bg-dark-card">
              <input
                type="number"
                value={buyQty}
                onChange={e => setBuyQty(e.target.value)}
                placeholder="Quantity"
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg w-32 focus:outline-none focus:ring-2 focus:ring-gain/50"
              />
              <span className="text-sm text-gray-500">= {formatPrice((parseFloat(buyQty) || 0) * price)}</span>
              <button onClick={handleBuy} className="px-4 py-1.5 text-sm font-medium rounded-lg bg-gain text-white hover:bg-gain/90 transition-colors">Confirm</button>
              {msg && <span className={`text-sm font-medium ${msg.includes('Bought') ? 'text-gain' : 'text-loss'}`}>{msg}</span>}
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-xl border border-gray-200 dark:border-dark-border p-4 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Price Chart</h2>
          <div className="flex gap-1">
            {TIME_RANGES.map(r => (
              <button key={r.days} onClick={() => setRange(r.days)} className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${range === r.days ? 'bg-gain text-white' : 'bg-gray-100 dark:bg-dark-card text-gray-600 dark:text-dark-muted hover:bg-gray-200 dark:hover:bg-dark-border'}`}>
                {r.label}
              </button>
            ))}
          </div>
        </div>
        {chartLoading ? (
          <div className="h-64 flex items-center justify-center"><LoadingSpinner /></div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartPoints}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" tickLine={false} />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11 }} stroke="#94a3b8" tickLine={false} tickFormatter={v => '$' + v.toLocaleString()} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 13 }}
                labelStyle={{ color: '#94a3b8' }}
                formatter={(v: number) => [formatPrice(v), 'Price']}
              />
              <Line type="monotone" dataKey="price" stroke={priceUp ? '#10B981' : '#EF4444'} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Market Cap', val: formatCurrency(md.market_cap.usd) },
          { label: '24h Volume', val: formatCurrency(md.total_volume.usd) },
          { label: '24h High', val: formatPrice(md.high_24h.usd) },
          { label: '24h Low', val: formatPrice(md.low_24h.usd) },
          { label: 'All-Time High', val: formatPrice(md.ath.usd) },
          { label: 'ATH Change', val: `${md.ath_change_percentage.usd.toFixed(2)}%` },
          { label: 'All-Time Low', val: formatPrice(md.atl.usd) },
          { label: 'Circulating Supply', val: formatNumber(md.circulating_supply) },
          { label: '7d Change', val: undefined, pct: md.price_change_percentage_7d },
          { label: '30d Change', val: undefined, pct: md.price_change_percentage_30d },
          { label: '1y Change', val: undefined, pct: md.price_change_percentage_1y },
          { label: 'Max Supply', val: md.max_supply ? formatNumber(md.max_supply) : '∞' },
        ].map(s => (
          <div key={s.label} className="p-4 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card">
            <div className="text-xs text-gray-500 dark:text-dark-muted mb-1">{s.label}</div>
            {s.pct !== undefined ? <PriceChange value={s.pct} /> : <div className="font-semibold text-sm">{s.val}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
