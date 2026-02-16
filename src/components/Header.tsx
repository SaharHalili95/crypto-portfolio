import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart3, Sun, Moon, Search, Menu, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { searchCoins } from '../services/api';

export default function Header() {
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ id: string; name: string; symbol: string; thumb: string }[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  const handleSearch = async (q: string) => {
    setQuery(q);
    if (q.length < 2) { setResults([]); setShowResults(false); return; }
    try {
      const data = await searchCoins(q);
      setResults(data.coins.slice(0, 8));
      setShowResults(true);
    } catch { setResults([]); }
  };

  const selectCoin = (id: string) => {
    setQuery('');
    setResults([]);
    setShowResults(false);
    navigate(`/coin/${id}`);
  };

  const navLinks = [
    { to: '/', label: 'Dashboard' },
    { to: '/portfolio', label: 'Portfolio' },
    { to: '/watchlist', label: 'Watchlist' },
    { to: '/heatmap', label: 'Heatmap' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 dark:border-dark-border bg-white/80 dark:bg-dark-bg/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white shrink-0">
          <BarChart3 className="w-6 h-6 text-gain" />
          <span className="hidden sm:inline">CryptoPortfolio</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 ml-4">
          {navLinks.map(l => (
            <Link key={l.to} to={l.to} className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-dark-muted hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-card transition-colors">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="relative flex-1 max-w-sm ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={query}
            onChange={e => handleSearch(e.target.value)}
            onBlur={() => setTimeout(() => setShowResults(false), 200)}
            onFocus={() => results.length > 0 && setShowResults(true)}
            placeholder="Search coins..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-card text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gain/50"
          />
          {showResults && results.length > 0 && (
            <div className="absolute top-full mt-1 w-full bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg shadow-lg overflow-hidden">
              {results.map(r => (
                <button key={r.id} onMouseDown={() => selectCoin(r.id)} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-dark-bg text-left">
                  <img src={r.thumb} alt="" className="w-6 h-6 rounded-full" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{r.name}</span>
                  <span className="text-xs text-gray-400 uppercase">{r.symbol}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button onClick={toggle} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-card transition-colors text-gray-600 dark:text-dark-muted">
          {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-card text-gray-600 dark:text-dark-muted">
          {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileMenu && (
        <nav className="md:hidden border-t border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg px-4 py-2">
          {navLinks.map(l => (
            <Link key={l.to} to={l.to} onClick={() => setMobileMenu(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-dark-muted hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-card">
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
