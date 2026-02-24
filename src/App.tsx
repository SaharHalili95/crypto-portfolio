import { HashRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { PortfolioProvider } from './context/PortfolioContext';
import { WatchlistProvider } from './context/WatchlistContext';
import { AlertProvider } from './context/AlertContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CoinDetail from './pages/CoinDetail';
import Portfolio from './pages/Portfolio';
import Watchlist from './pages/Watchlist';
import Heatmap from './pages/Heatmap';
import Alerts from './pages/Alerts';

export default function App() {
  return (
    <ThemeProvider>
      <PortfolioProvider>
        <WatchlistProvider>
          <AlertProvider>
            <HashRouter>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/coin/:id" element={<CoinDetail />} />
                  <Route path="/portfolio" element={<Portfolio />} />
                  <Route path="/watchlist" element={<Watchlist />} />
                  <Route path="/heatmap" element={<Heatmap />} />
                  <Route path="/alerts" element={<Alerts />} />
                </Routes>
              </Layout>
            </HashRouter>
          </AlertProvider>
        </WatchlistProvider>
      </PortfolioProvider>
    </ThemeProvider>
  );
}
