import type { ReactNode } from 'react';
import Header from './Header';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-dark-text transition-colors">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-6">
        {children}
      </main>
      <footer className="max-w-7xl mx-auto px-4 pb-8 text-sm text-gray-500 dark:text-gray-400">
        <p>
          © 2025-2026 Sahar Halili. Data provided by{' '}
          <a href="https://www.coingecko.com/" className="underline">CoinGecko</a>.
          {' '}The portfolio uses virtual money only. Nothing here is investment advice.
        </p>
      </footer>
    </div>
  );
}
