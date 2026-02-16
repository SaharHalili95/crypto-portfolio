import { TrendingUp, TrendingDown } from 'lucide-react';

export default function PriceChange({ value }: { value: number | undefined }) {
  if (value == null) return <span className="text-gray-400">-</span>;
  const positive = value >= 0;
  return (
    <span className={`inline-flex items-center gap-1 text-sm font-medium ${positive ? 'text-gain' : 'text-loss'}`}>
      {positive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
      {positive ? '+' : ''}{value.toFixed(2)}%
    </span>
  );
}
