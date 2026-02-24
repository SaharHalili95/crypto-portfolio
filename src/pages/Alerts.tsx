import { Bell, Trash2 } from 'lucide-react';
import { useAlerts } from '../context/AlertContext';
import { formatPrice } from '../components/FormatNumber';

export default function Alerts() {
  const { alerts, removeAlert, clearTriggered } = useAlerts();

  const active = alerts.filter(a => !a.triggered);
  const triggered = alerts.filter(a => a.triggered);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Price Alerts</h1>
        {triggered.length > 0 && (
          <button
            onClick={clearTriggered}
            className="text-sm text-loss hover:underline"
          >
            Clear triggered ({triggered.length})
          </button>
        )}
      </div>

      {alerts.length === 0 ? (
        <div className="text-center py-20">
          <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-dark-muted" />
          <p className="text-gray-500 dark:text-dark-muted text-lg">No alerts set</p>
          <p className="text-gray-400 dark:text-dark-muted text-sm mt-1">
            Visit a coin page and click "Alert" to set price alerts
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {active.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 dark:text-dark-muted uppercase tracking-wider mb-3">
                Active ({active.length})
              </h2>
              <div className="space-y-2">
                {active.map(alert => (
                  <div key={alert.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card">
                    <div>
                      <div className="font-semibold">
                        {alert.name} <span className="text-gray-400 uppercase text-sm">{alert.symbol}</span>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
                        Alert when price goes{' '}
                        <span className={alert.condition === 'above' ? 'text-gain font-medium' : 'text-loss font-medium'}>
                          {alert.condition}
                        </span>{' '}
                        {formatPrice(alert.targetPrice)}
                      </div>
                    </div>
                    <button
                      onClick={() => removeAlert(alert.id)}
                      className="p-2 text-gray-400 hover:text-loss rounded-lg hover:bg-gray-100 dark:hover:bg-dark-bg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {triggered.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 dark:text-dark-muted uppercase tracking-wider mb-3">
                Triggered ({triggered.length})
              </h2>
              <div className="space-y-2">
                {triggered.map(alert => (
                  <div key={alert.id} className="flex items-center justify-between p-4 rounded-xl border border-gain/30 bg-gain/5">
                    <div>
                      <div className="font-semibold">
                        {alert.name} <span className="text-gray-400 uppercase text-sm">{alert.symbol}</span>
                      </div>
                      <div className="text-sm text-gain mt-0.5">
                        Triggered: {alert.condition} {formatPrice(alert.targetPrice)}
                        {alert.triggeredAt && (
                          <span className="text-gray-400 ml-2">
                            {new Date(alert.triggeredAt).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => removeAlert(alert.id)}
                      className="p-2 text-gray-400 hover:text-loss rounded-lg hover:bg-gray-100 dark:hover:bg-dark-bg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
