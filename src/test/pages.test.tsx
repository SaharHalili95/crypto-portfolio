import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '../context/ThemeContext';
import { PortfolioProvider } from '../context/PortfolioContext';
import { WatchlistProvider } from '../context/WatchlistContext';
import Dashboard from '../pages/Dashboard';
import Watchlist from '../pages/Watchlist';
import Heatmap from '../pages/Heatmap';
import Portfolio from '../pages/Portfolio';

const mockCoins = [
  {
    id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', image: 'https://img.com/btc.png',
    current_price: 50000, market_cap: 1000000000000, market_cap_rank: 1,
    total_volume: 30000000000, price_change_percentage_24h: 2.5,
    price_change_percentage_7d_in_currency: 5.1,
    high_24h: 51000, low_24h: 49000, price_change_24h: 1200,
    market_cap_change_24h: 10000000, market_cap_change_percentage_24h: 1.0,
    circulating_supply: 19000000, total_supply: 21000000, max_supply: 21000000,
    ath: 69000, ath_change_percentage: -27, ath_date: '2021-11-10',
    atl: 67, atl_change_percentage: 74000, atl_date: '2013-07-06',
    fully_diluted_valuation: 1050000000000, last_updated: '2024-01-01',
    sparkline_in_7d: { price: Array.from({ length: 168 }, (_, i) => 48000 + i * 20) },
  },
  {
    id: 'ethereum', symbol: 'eth', name: 'Ethereum', image: 'https://img.com/eth.png',
    current_price: 3000, market_cap: 360000000000, market_cap_rank: 2,
    total_volume: 15000000000, price_change_percentage_24h: -1.2,
    price_change_percentage_7d_in_currency: -3.4,
    high_24h: 3100, low_24h: 2950, price_change_24h: -36,
    market_cap_change_24h: -5000000, market_cap_change_percentage_24h: -0.5,
    circulating_supply: 120000000, total_supply: null, max_supply: null,
    ath: 4800, ath_change_percentage: -37.5, ath_date: '2021-11-10',
    atl: 0.43, atl_change_percentage: 700000, atl_date: '2015-10-20',
    fully_diluted_valuation: null, last_updated: '2024-01-01',
    sparkline_in_7d: { price: Array.from({ length: 168 }, (_, i) => 3200 - i * 2) },
  },
];

// Mock the API module
vi.mock('../services/api', () => ({
  getCoins: vi.fn(() => Promise.resolve(mockCoins)),
  getCoinDetail: vi.fn(),
  getCoinChart: vi.fn(),
  searchCoins: vi.fn(() => Promise.resolve({ coins: [] })),
}));

function Providers({ children, initialRoute = '/' }: { children: React.ReactNode; initialRoute?: string }) {
  return (
    <ThemeProvider>
      <PortfolioProvider>
        <WatchlistProvider>
          <MemoryRouter initialEntries={[initialRoute]}>{children}</MemoryRouter>
        </WatchlistProvider>
      </PortfolioProvider>
    </ThemeProvider>
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe('Dashboard Page', () => {
  it('renders title and coin table', async () => {
    render(<Providers><Dashboard /></Providers>);

    await waitFor(() => {
      expect(screen.getByText('Top 100 Cryptocurrencies')).toBeInTheDocument();
    });

    expect(screen.getByText('Bitcoin')).toBeInTheDocument();
    expect(screen.getByText('Ethereum')).toBeInTheDocument();
  });

  it('shows filter input', async () => {
    render(<Providers><Dashboard /></Providers>);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Filter coins...')).toBeInTheDocument();
    });
  });

  it('displays price change indicators', async () => {
    render(<Providers><Dashboard /></Providers>);

    await waitFor(() => {
      expect(screen.getByText('+2.50%')).toBeInTheDocument(); // BTC 24h
      expect(screen.getByText('-1.20%')).toBeInTheDocument(); // ETH 24h
    });
  });
});

describe('Watchlist Page', () => {
  it('shows empty state when no coins watched', async () => {
    render(<Providers><Watchlist /></Providers>);

    await waitFor(() => {
      expect(screen.getByText('Your watchlist is empty')).toBeInTheDocument();
    });
  });

  it('shows watched coins', async () => {
    localStorage.setItem('crypto-watchlist', JSON.stringify(['bitcoin']));
    render(<Providers><Watchlist /></Providers>);

    await waitFor(() => {
      expect(screen.getByText('Bitcoin')).toBeInTheDocument();
    });
  });
});

describe('Heatmap Page', () => {
  it('renders heatmap title and coins', async () => {
    render(<Providers><Heatmap /></Providers>);

    await waitFor(() => {
      expect(screen.getByText('Market Heatmap')).toBeInTheDocument();
    });

    expect(screen.getByText('BTC')).toBeInTheDocument();
    expect(screen.getByText('ETH')).toBeInTheDocument();
  });
});

describe('Portfolio Page', () => {
  it('shows initial $10,000 balance', async () => {
    render(<Providers><Portfolio /></Providers>);

    await waitFor(() => {
      const balances = screen.getAllByText('$10,000.00');
      expect(balances.length).toBeGreaterThanOrEqual(2); // Net Worth + Cash Balance
    });
  });

  it('shows empty holdings message', async () => {
    render(<Providers><Portfolio /></Providers>);

    await waitFor(() => {
      expect(screen.getByText('No holdings yet')).toBeInTheDocument();
    });
  });

  it('shows no transactions message', async () => {
    render(<Providers><Portfolio /></Providers>);

    await waitFor(() => {
      expect(screen.getByText('No transactions yet')).toBeInTheDocument();
    });
  });
});
