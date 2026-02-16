import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WatchlistProvider, useWatchlist } from '../context/WatchlistContext';

function TestConsumer() {
  const { watchlist, toggle, isWatched } = useWatchlist();
  return (
    <div>
      <span data-testid="count">{watchlist.length}</span>
      <span data-testid="has-btc">{isWatched('bitcoin') ? 'yes' : 'no'}</span>
      <span data-testid="has-eth">{isWatched('ethereum') ? 'yes' : 'no'}</span>
      <button data-testid="toggle-btc" onClick={() => toggle('bitcoin')}>Toggle BTC</button>
      <button data-testid="toggle-eth" onClick={() => toggle('ethereum')}>Toggle ETH</button>
    </div>
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe('WatchlistContext', () => {
  it('starts with empty watchlist', () => {
    render(<WatchlistProvider><TestConsumer /></WatchlistProvider>);
    expect(screen.getByTestId('count').textContent).toBe('0');
    expect(screen.getByTestId('has-btc').textContent).toBe('no');
  });

  it('adds coin to watchlist on toggle', () => {
    render(<WatchlistProvider><TestConsumer /></WatchlistProvider>);
    fireEvent.click(screen.getByTestId('toggle-btc'));

    expect(screen.getByTestId('count').textContent).toBe('1');
    expect(screen.getByTestId('has-btc').textContent).toBe('yes');
  });

  it('removes coin on second toggle', () => {
    render(<WatchlistProvider><TestConsumer /></WatchlistProvider>);
    fireEvent.click(screen.getByTestId('toggle-btc'));
    fireEvent.click(screen.getByTestId('toggle-btc'));

    expect(screen.getByTestId('count').textContent).toBe('0');
    expect(screen.getByTestId('has-btc').textContent).toBe('no');
  });

  it('handles multiple coins independently', () => {
    render(<WatchlistProvider><TestConsumer /></WatchlistProvider>);
    fireEvent.click(screen.getByTestId('toggle-btc'));
    fireEvent.click(screen.getByTestId('toggle-eth'));

    expect(screen.getByTestId('count').textContent).toBe('2');
    expect(screen.getByTestId('has-btc').textContent).toBe('yes');
    expect(screen.getByTestId('has-eth').textContent).toBe('yes');

    fireEvent.click(screen.getByTestId('toggle-btc'));
    expect(screen.getByTestId('count').textContent).toBe('1');
    expect(screen.getByTestId('has-btc').textContent).toBe('no');
    expect(screen.getByTestId('has-eth').textContent).toBe('yes');
  });

  it('persists to localStorage', () => {
    render(<WatchlistProvider><TestConsumer /></WatchlistProvider>);
    fireEvent.click(screen.getByTestId('toggle-btc'));

    const saved = JSON.parse(localStorage.getItem('crypto-watchlist')!);
    expect(saved).toEqual(['bitcoin']);
  });
});
