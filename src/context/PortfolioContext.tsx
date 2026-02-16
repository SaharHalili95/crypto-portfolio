import { createContext, useContext, useState, type ReactNode } from 'react';
import type { PortfolioState, PortfolioHolding, Transaction } from '../types';

const INITIAL_BALANCE = 10_000;

interface PortfolioContextType extends PortfolioState {
  buy: (coinId: string, symbol: string, name: string, image: string, quantity: number, price: number) => boolean;
  sell: (coinId: string, quantity: number, price: number) => boolean;
}

const PortfolioContext = createContext<PortfolioContextType | null>(null);

function loadState(): PortfolioState {
  try {
    const saved = localStorage.getItem('crypto-portfolio');
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return { balance: INITIAL_BALANCE, holdings: [], transactions: [] };
}

function saveState(state: PortfolioState) {
  localStorage.setItem('crypto-portfolio', JSON.stringify(state));
}

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PortfolioState>(loadState);

  const buy = (coinId: string, symbol: string, name: string, image: string, quantity: number, price: number): boolean => {
    const total = quantity * price;
    if (total > state.balance) return false;

    setState(prev => {
      const existing = prev.holdings.find(h => h.coinId === coinId);
      let holdings: PortfolioHolding[];
      if (existing) {
        const newQty = existing.totalQuantity + quantity;
        const newAvg = ((existing.avgBuyPrice * existing.totalQuantity) + total) / newQty;
        holdings = prev.holdings.map(h =>
          h.coinId === coinId ? { ...h, totalQuantity: newQty, avgBuyPrice: newAvg } : h
        );
      } else {
        holdings = [...prev.holdings, { coinId, symbol, name, image, totalQuantity: quantity, avgBuyPrice: price }];
      }

      const tx: Transaction = {
        id: crypto.randomUUID(),
        coinId, symbol, name, type: 'buy', quantity, price, total, date: new Date().toISOString(),
      };

      const next = { balance: prev.balance - total, holdings, transactions: [tx, ...prev.transactions] };
      saveState(next);
      return next;
    });
    return true;
  };

  const sell = (coinId: string, quantity: number, price: number): boolean => {
    const holding = state.holdings.find(h => h.coinId === coinId);
    if (!holding || holding.totalQuantity < quantity) return false;

    setState(prev => {
      const h = prev.holdings.find(h => h.coinId === coinId)!;
      const remaining = h.totalQuantity - quantity;
      const holdings = remaining > 0
        ? prev.holdings.map(x => x.coinId === coinId ? { ...x, totalQuantity: remaining } : x)
        : prev.holdings.filter(x => x.coinId !== coinId);

      const total = quantity * price;
      const tx: Transaction = {
        id: crypto.randomUUID(),
        coinId, symbol: h.symbol, name: h.name, type: 'sell', quantity, price, total, date: new Date().toISOString(),
      };

      const next = { balance: prev.balance + total, holdings, transactions: [tx, ...prev.transactions] };
      saveState(next);
      return next;
    });
    return true;
  };

  return (
    <PortfolioContext.Provider value={{ ...state, buy, sell }}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error('usePortfolio must be used within PortfolioProvider');
  return ctx;
}
