import { useState } from 'react';
import { useAlerts } from '../context/AlertContext';
import { formatPrice } from './FormatNumber';

interface AlertFormProps {
  coinId: string;
  symbol: string;
  name: string;
  currentPrice: number;
  onClose: () => void;
}

export default function AlertForm({ coinId, symbol, name, currentPrice, onClose }: AlertFormProps) {
  const { addAlert } = useAlerts();
  const [condition, setCondition] = useState<'above' | 'below'>('above');
  const [targetPrice, setTargetPrice] = useState(
    condition === 'above'
      ? (currentPrice * 1.05).toFixed(2)
      : (currentPrice * 0.95).toFixed(2)
  );

  const handleConditionChange = (c: 'above' | 'below') => {
    setCondition(c);
    setTargetPrice(
      c === 'above'
        ? (currentPrice * 1.05).toFixed(2)
        : (currentPrice * 0.95).toFixed(2)
    );
  };

  const handleSubmit = () => {
    const price = parseFloat(targetPrice);
    if (!price || price <= 0) return;
    addAlert({ coinId, symbol, name, targetPrice: price, condition });
    onClose();
  };

  return (
    <div className="flex flex-col gap-3 p-3 rounded-lg bg-gray-100 dark:bg-dark-card">
      <div className="text-xs text-gray-500 dark:text-dark-muted">
        Current: {formatPrice(currentPrice)}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => handleConditionChange('above')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
            condition === 'above'
              ? 'bg-gain text-white'
              : 'bg-gray-200 dark:bg-dark-bg text-gray-600 dark:text-dark-muted'
          }`}
        >
          Above
        </button>
        <button
          onClick={() => handleConditionChange('below')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
            condition === 'below'
              ? 'bg-loss text-white'
              : 'bg-gray-200 dark:bg-dark-bg text-gray-600 dark:text-dark-muted'
          }`}
        >
          Below
        </button>
      </div>

      <div className="flex gap-2 items-center">
        <span className="text-sm text-gray-500 dark:text-dark-muted">$</span>
        <input
          type="number"
          value={targetPrice}
          onChange={e => setTargetPrice(e.target.value)}
          step="0.01"
          className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gain/50"
        />
        <button
          onClick={handleSubmit}
          className="px-4 py-1.5 text-sm font-medium rounded-lg bg-gain text-white hover:bg-gain/90 transition-colors"
        >
          Set Alert
        </button>
      </div>
    </div>
  );
}
