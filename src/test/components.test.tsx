import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '../context/ThemeContext';
import { PortfolioProvider } from '../context/PortfolioContext';
import { WatchlistProvider } from '../context/WatchlistContext';
import PriceChange from '../components/PriceChange';
import LoadingSpinner from '../components/LoadingSpinner';
import Layout from '../components/Layout';

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <PortfolioProvider>
        <WatchlistProvider>
          <MemoryRouter>{children}</MemoryRouter>
        </WatchlistProvider>
      </PortfolioProvider>
    </ThemeProvider>
  );
}

describe('PriceChange', () => {
  it('renders positive change in green', () => {
    render(<PriceChange value={5.67} />);
    const el = screen.getByText('+5.67%');
    expect(el).toBeInTheDocument();
    expect(el.className).toContain('text-gain');
  });

  it('renders negative change in red', () => {
    render(<PriceChange value={-3.21} />);
    const el = screen.getByText('-3.21%');
    expect(el).toBeInTheDocument();
    expect(el.className).toContain('text-loss');
  });

  it('renders dash for null/undefined', () => {
    render(<PriceChange value={undefined} />);
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('renders zero as positive', () => {
    render(<PriceChange value={0} />);
    expect(screen.getByText('+0.00%')).toBeInTheDocument();
  });
});

describe('LoadingSpinner', () => {
  it('renders spinner element', () => {
    const { container } = render(<LoadingSpinner />);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });
});

describe('Layout', () => {
  it('renders header and children', () => {
    render(
      <Providers>
        <Layout><div data-testid="child">Hello</div></Layout>
      </Providers>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Hello')).toBeInTheDocument();
    // Header should render navigation links
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Portfolio')).toBeInTheDocument();
    expect(screen.getByText('Watchlist')).toBeInTheDocument();
    expect(screen.getByText('Heatmap')).toBeInTheDocument();
  });
});
