import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { PriceAlert } from '../types';
import { getCoins } from '../services/api';

interface AlertContextType {
  alerts: PriceAlert[];
  addAlert: (alert: Omit<PriceAlert, 'id' | 'createdAt' | 'triggered'>) => void;
  removeAlert: (id: string) => void;
  clearTriggered: () => void;
  activeCount: number;
}

const AlertContext = createContext<AlertContextType | null>(null);

function loadAlerts(): PriceAlert[] {
  try {
    const saved = localStorage.getItem('crypto-alerts');
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return [];
}

function saveAlerts(alerts: PriceAlert[]) {
  localStorage.setItem('crypto-alerts', JSON.stringify(alerts));
}

function playAlertSound() {
  try {
    const ctx = new AudioContext();
    [0, 150, 300].forEach(delay => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.value = 0.2;
      osc.start(ctx.currentTime + delay / 1000);
      osc.stop(ctx.currentTime + delay / 1000 + 0.1);
    });
  } catch { /* audio not available */ }
}

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<PriceAlert[]>(loadAlerts);

  useEffect(() => {
    saveAlerts(alerts);
  }, [alerts]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Periodic price check
  useEffect(() => {
    const checkAlerts = async () => {
      const active = alerts.filter(a => !a.triggered);
      if (active.length === 0) return;

      try {
        const coins = await getCoins(1, 100);
        const priceMap = new Map(coins.map(c => [c.id, c.current_price]));

        let triggered = false;
        setAlerts(prev => prev.map(alert => {
          if (alert.triggered) return alert;
          const price = priceMap.get(alert.coinId);
          if (!price) return alert;

          const shouldTrigger =
            (alert.condition === 'above' && price >= alert.targetPrice) ||
            (alert.condition === 'below' && price <= alert.targetPrice);

          if (shouldTrigger) {
            triggered = true;
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(`Price Alert: ${alert.name}`, {
                body: `${alert.symbol.toUpperCase()} is ${alert.condition} $${alert.targetPrice} (now $${price.toLocaleString()})`,
              });
            }
            return { ...alert, triggered: true, triggeredAt: new Date().toISOString() };
          }
          return alert;
        }));

        if (triggered) playAlertSound();
      } catch { /* API error, skip */ }
    };

    checkAlerts();
    const interval = setInterval(checkAlerts, 60000);
    return () => clearInterval(interval);
  }, [alerts]);

  const addAlert = useCallback((alert: Omit<PriceAlert, 'id' | 'createdAt' | 'triggered'>) => {
    const newAlert: PriceAlert = {
      ...alert,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      triggered: false,
    };
    setAlerts(prev => [...prev, newAlert]);
  }, []);

  const removeAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  }, []);

  const clearTriggered = useCallback(() => {
    setAlerts(prev => prev.filter(a => !a.triggered));
  }, []);

  const activeCount = alerts.filter(a => !a.triggered).length;

  return (
    <AlertContext.Provider value={{ alerts, addAlert, removeAlert, clearTriggered, activeCount }}>
      {children}
    </AlertContext.Provider>
  );
}

export function useAlerts() {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error('useAlerts must be used within AlertProvider');
  return ctx;
}
