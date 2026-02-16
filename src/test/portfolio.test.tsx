import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PortfolioProvider, usePortfolio } from '../context/PortfolioContext';

// Helper component to test portfolio context
function TestConsumer() {
  const { balance, holdings, transactions, buy, sell } = usePortfolio();
  return (
    <div>
      <span data-testid="balance">{balance.toFixed(2)}</span>
      <span data-testid="holdings-count">{holdings.length}</span>
      <span data-testid="tx-count">{transactions.length}</span>
      <button data-testid="buy-btc" onClick={() => buy('bitcoin', 'btc', 'Bitcoin', 'img.png', 0.1, 50000)}>Buy BTC</button>
      <button data-testid="buy-too-much" onClick={() => {
        const result = buy('bitcoin', 'btc', 'Bitcoin', 'img.png', 1, 999999);
        if (!result) document.getElementById('msg')!.textContent = 'FAILED';
      }}>Buy Too Much</button>
      <button data-testid="sell-btc" onClick={() => sell('bitcoin', 0.05, 55000)}>Sell BTC</button>
      <button data-testid="sell-too-much" onClick={() => {
        const result = sell('bitcoin', 999, 50000);
        if (!result) document.getElementById('msg2')!.textContent = 'SELL_FAILED';
      }}>Sell Too Much</button>
      <span id="msg"></span>
      <span id="msg2"></span>
      {holdings.map(h => (
        <div key={h.coinId} data-testid={`holding-${h.coinId}`}>
          {h.totalQuantity.toFixed(6)} @ {h.avgBuyPrice.toFixed(2)}
        </div>
      ))}
    </div>
  );
}

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal('crypto', { randomUUID: () => 'test-uuid-' + Math.random() });
});

describe('PortfolioContext', () => {
  it('starts with $10,000 balance', () => {
    render(<PortfolioProvider><TestConsumer /></PortfolioProvider>);
    expect(screen.getByTestId('balance').textContent).toBe('10000.00');
    expect(screen.getByTestId('holdings-count').textContent).toBe('0');
    expect(screen.getByTestId('tx-count').textContent).toBe('0');
  });

  it('allows buying coins and updates balance', () => {
    render(<PortfolioProvider><TestConsumer /></PortfolioProvider>);

    fireEvent.click(screen.getByTestId('buy-btc')); // Buy 0.1 BTC @ $50000 = $5000

    expect(screen.getByTestId('balance').textContent).toBe('5000.00');
    expect(screen.getByTestId('holdings-count').textContent).toBe('1');
    expect(screen.getByTestId('tx-count').textContent).toBe('1');
    expect(screen.getByTestId('holding-bitcoin').textContent).toContain('0.100000');
  });

  it('rejects purchase exceeding balance', () => {
    render(<PortfolioProvider><TestConsumer /></PortfolioProvider>);

    fireEvent.click(screen.getByTestId('buy-too-much'));
    expect(document.getElementById('msg')!.textContent).toBe('FAILED');
    expect(screen.getByTestId('balance').textContent).toBe('10000.00');
  });

  it('allows selling coins and updates balance', () => {
    render(<PortfolioProvider><TestConsumer /></PortfolioProvider>);

    fireEvent.click(screen.getByTestId('buy-btc')); // Buy 0.1 @ 50000
    fireEvent.click(screen.getByTestId('sell-btc')); // Sell 0.05 @ 55000 = +2750

    expect(screen.getByTestId('balance').textContent).toBe('7750.00'); // 10000 - 5000 + 2750
    expect(screen.getByTestId('tx-count').textContent).toBe('2');
    expect(screen.getByTestId('holding-bitcoin').textContent).toContain('0.050000');
  });

  it('rejects selling more than owned', () => {
    render(<PortfolioProvider><TestConsumer /></PortfolioProvider>);

    fireEvent.click(screen.getByTestId('sell-too-much'));
    expect(document.getElementById('msg2')!.textContent).toBe('SELL_FAILED');
  });

  it('persists state to localStorage', () => {
    render(<PortfolioProvider><TestConsumer /></PortfolioProvider>);
    fireEvent.click(screen.getByTestId('buy-btc'));

    const saved = JSON.parse(localStorage.getItem('crypto-portfolio')!);
    expect(saved.balance).toBe(5000);
    expect(saved.holdings).toHaveLength(1);
    expect(saved.transactions).toHaveLength(1);
  });

  it('averages buy price on multiple buys', () => {
    render(<PortfolioProvider><TestConsumer /></PortfolioProvider>);

    fireEvent.click(screen.getByTestId('buy-btc')); // 0.1 @ 50000
    fireEvent.click(screen.getByTestId('buy-btc')); // another 0.1 @ 50000

    expect(screen.getByTestId('holding-bitcoin').textContent).toContain('0.200000');
    expect(screen.getByTestId('holding-bitcoin').textContent).toContain('50000.00');
  });
});
