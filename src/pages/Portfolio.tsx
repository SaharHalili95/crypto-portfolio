import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Wallet, TrendingUp, TrendingDown, ArrowUpDown } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { useCoins } from '../hooks/useCoins';
import { formatPrice, formatCurrency } from '../components/FormatNumber';
import PriceChange from '../components/PriceChange';
import LoadingSpinner from '../components/LoadingSpinner';

const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4', '#84CC16'];

export default function Portfolio() {
  const { balance, holdings, transactions, sell } = usePortfolio();
  const { coins, loading } = useCoins();
  const [sellState, setSellState] = useState<{ coinId: string; qty: string } | null>(null);
  const [msg, setMsg] = useState('');

  // Prices map
  const prices = useMemo(() => {
    const map = new Map<string, number>();
    coins.forEach(c => map.set(c.id, c.current_price));
    return map;
  }, [coins]);

  const holdingsWithValue = useMemo(() =>
    holdings.map(h => {
      const currentPrice = prices.get(h.coinId) ?? h.avgBuyPrice;
      const value = h.totalQuantity * currentPrice;
      const cost = h.totalQuantity * h.avgBuyPrice;
      const pnl = value - cost;
      const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0;
      return { ...h, currentPrice, value, cost, pnl, pnlPct };
    }).sort((a, b) => b.value - a.value),
  [holdings, prices]);

  const totalValue = holdingsWithValue.reduce((s, h) => s + h.value, 0);
  const totalCost = holdingsWithValue.reduce((s, h) => s + h.cost, 0);
  const totalPnl = totalValue - totalCost;
  const totalPnlPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;
  const netWorth = balance + totalValue;

  const pieData = holdingsWithValue.map(h => ({ name: h.symbol.toUpperCase(), value: h.value }));

  const handleSell = (coinId: string) => {
    if (!sellState || sellState.coinId !== coinId) return;
    const qty = parseFloat(sellState.qty);
    if (!qty || qty <= 0) return;
    const price = prices.get(coinId) ?? 0;
    const ok = sell(coinId, qty, price);
    setMsg(ok ? `Sold successfully!` : 'Insufficient quantity');
    setSellState(null);
    setTimeout(() => setMsg(''), 3000);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-dark-muted mb-1"><Wallet className="w-3.5 h-3.5" /> Net Worth</div>
          <div className="text-xl font-bold">{formatPrice(netWorth)}</div>
        </div>
        <div className="p-4 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card">
          <div className="text-xs text-gray-500 dark:text-dark-muted mb-1">Cash Balance</div>
          <div className="text-xl font-bold">{formatPrice(balance)}</div>
        </div>
        <div className="p-4 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card">
          <div className="text-xs text-gray-500 dark:text-dark-muted mb-1">Holdings Value</div>
          <div className="text-xl font-bold">{formatPrice(totalValue)}</div>
        </div>
        <div className="p-4 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-dark-muted mb-1">
            {totalPnl >= 0 ? <TrendingUp className="w-3.5 h-3.5 text-gain" /> : <TrendingDown className="w-3.5 h-3.5 text-loss" />} Total P&L
          </div>
          <div className={`text-xl font-bold ${totalPnl >= 0 ? 'text-gain' : 'text-loss'}`}>
            {totalPnl >= 0 ? '+' : ''}{formatPrice(totalPnl)} ({totalPnlPct >= 0 ? '+' : ''}{totalPnlPct.toFixed(2)}%)
          </div>
        </div>
      </div>

      {msg && <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${msg.includes('Sold') ? 'bg-gain/10 text-gain' : 'bg-loss/10 text-loss'}`}>{msg}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Holdings Table */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-bold mb-4">Holdings</h2>
          {holdingsWithValue.length === 0 ? (
            <div className="text-center py-12 text-gray-400 dark:text-dark-muted border border-gray-200 dark:border-dark-border rounded-xl">
              <p className="mb-2">No holdings yet</p>
              <Link to="/" className="text-gain hover:underline text-sm">Browse coins to start trading</Link>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-dark-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-dark-card text-left">
                    <th className="px-3 py-3">Coin</th>
                    <th className="px-3 py-3 text-right">Qty</th>
                    <th className="px-3 py-3 text-right">Avg Price</th>
                    <th className="px-3 py-3 text-right">Current</th>
                    <th className="px-3 py-3 text-right">Value</th>
                    <th className="px-3 py-3 text-right">P&L</th>
                    <th className="px-3 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                  {holdingsWithValue.map(h => (
                    <tr key={h.coinId} className="hover:bg-gray-50 dark:hover:bg-dark-card/50">
                      <td className="px-3 py-3">
                        <Link to={`/coin/${h.coinId}`} className="flex items-center gap-2 hover:underline">
                          <img src={h.image} alt="" className="w-5 h-5 rounded-full" />
                          <span className="font-medium">{h.symbol.toUpperCase()}</span>
                        </Link>
                      </td>
                      <td className="px-3 py-3 text-right">{h.totalQuantity.toFixed(6)}</td>
                      <td className="px-3 py-3 text-right">{formatPrice(h.avgBuyPrice)}</td>
                      <td className="px-3 py-3 text-right">{formatPrice(h.currentPrice)}</td>
                      <td className="px-3 py-3 text-right font-medium">{formatPrice(h.value)}</td>
                      <td className="px-3 py-3 text-right">
                        <span className={h.pnl >= 0 ? 'text-gain' : 'text-loss'}>
                          {h.pnl >= 0 ? '+' : ''}{formatPrice(h.pnl)} ({h.pnlPct >= 0 ? '+' : ''}{h.pnlPct.toFixed(2)}%)
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right">
                        {sellState?.coinId === h.coinId ? (
                          <div className="flex items-center gap-1 justify-end">
                            <input type="number" value={sellState.qty} onChange={e => setSellState({ coinId: h.coinId, qty: e.target.value })} className="w-20 px-2 py-1 text-xs rounded border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg focus:outline-none" placeholder="Qty" />
                            <button onClick={() => handleSell(h.coinId)} className="px-2 py-1 text-xs rounded bg-loss text-white hover:bg-loss/90">Sell</button>
                            <button onClick={() => setSellState(null)} className="px-2 py-1 text-xs rounded border border-gray-200 dark:border-dark-border hover:bg-gray-100 dark:hover:bg-dark-card">X</button>
                          </div>
                        ) : (
                          <button onClick={() => setSellState({ coinId: h.coinId, qty: '' })} className="px-3 py-1 text-xs rounded border border-loss text-loss hover:bg-loss/10 transition-colors">Sell</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pie Chart */}
        <div>
          <h2 className="text-lg font-bold mb-4">Allocation</h2>
          <div className="rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card p-4">
            {pieData.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">No holdings</div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number | undefined) => formatPrice(v ?? 0)} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><ArrowUpDown className="w-5 h-5" /> Transaction History</h2>
      {transactions.length === 0 ? (
        <div className="text-center py-8 text-gray-400 dark:text-dark-muted border border-gray-200 dark:border-dark-border rounded-xl">No transactions yet</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-dark-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-dark-card text-left">
                <th className="px-3 py-3">Date</th>
                <th className="px-3 py-3">Type</th>
                <th className="px-3 py-3">Coin</th>
                <th className="px-3 py-3 text-right">Quantity</th>
                <th className="px-3 py-3 text-right">Price</th>
                <th className="px-3 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
              {transactions.slice(0, 50).map(tx => (
                <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-dark-card/50">
                  <td className="px-3 py-3 text-gray-500">{new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="px-3 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${tx.type === 'buy' ? 'bg-gain/10 text-gain' : 'bg-loss/10 text-loss'}`}>
                      {tx.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-3 py-3 font-medium">{tx.symbol.toUpperCase()}</td>
                  <td className="px-3 py-3 text-right">{tx.quantity.toFixed(6)}</td>
                  <td className="px-3 py-3 text-right">{formatPrice(tx.price)}</td>
                  <td className="px-3 py-3 text-right font-medium">{formatPrice(tx.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
