# CryptoPortfolio - Crypto Investment Tracker & Dashboard

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![Tested](https://img.shields.io/badge/tests-vitest-6E9F18?logo=vitest&logoColor=white)

Real-time cryptocurrency tracking dashboard with virtual portfolio management. Track the top 100 coins, simulate trades with a $10K virtual balance, and analyze the market - all powered by live CoinGecko data.

**[Live Demo](https://saharhalili95.github.io/crypto-portfolio/)**

## Features

### Dashboard
- Top 100 cryptocurrencies ranked by market cap
- Sortable columns: price, 24h/7d change, market cap, volume
- Inline 7-day sparkline charts per coin
- Real-time search and filtering
- Auto-refresh every 60 seconds

### Coin Detail
- Interactive price charts with 24h / 7d / 30d / 1y time ranges
- 12-stat grid: market cap, volume, ATH, ATL, supply, and more
- One-click buy with live USD cost preview

### Portfolio
- Paper trading with **$10,000 virtual balance**
- Holdings table with real-time P&L tracking
- Pie chart showing portfolio allocation
- Full transaction history (buy/sell)
- Net worth and total P&L summary

### Watchlist
- Star coins from any page to track them
- Card grid with price, sparkline, and market data

### Market Heatmap
- Top 50 coins visualized as colored blocks
- Block size = market cap, color = 24h price change
- Clickable for quick navigation to coin details

### Additional
- **Dark/Light theme** with smooth transitions
- **Global search** with live dropdown results
- **Responsive design** with mobile hamburger menu
- **Client-side caching** (60s TTL) to minimize API calls
- **localStorage persistence** for portfolio, watchlist, and theme

## Tech Stack

- **Framework:** React 19 + React Router 7
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Charts:** Recharts
- **Icons:** Lucide React
- **Build Tool:** Vite 7
- **Testing:** Vitest + Testing Library
- **API:** CoinGecko v3 (free, no key required)
- **Deployment:** GitHub Pages

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.tsx       # Navigation, search, theme toggle
│   ├── SparklineChart.tsx
│   ├── PriceChange.tsx
│   └── FormatNumber.tsx
├── pages/               # Route pages
│   ├── Dashboard.tsx    # Top 100 coins table
│   ├── CoinDetail.tsx   # Individual coin view
│   ├── Portfolio.tsx    # Holdings and transactions
│   ├── Watchlist.tsx    # Watched coins grid
│   └── Heatmap.tsx      # Market cap heatmap
├── context/             # React Context providers
│   ├── ThemeContext.tsx
│   ├── PortfolioContext.tsx
│   └── WatchlistContext.tsx
├── hooks/               # Custom data-fetching hooks
│   ├── useCoins.ts
│   ├── useCoinDetail.ts
│   └── useCoinChart.ts
├── services/
│   └── api.ts           # CoinGecko API client with caching
├── types/
│   └── index.ts         # TypeScript interfaces
└── test/                # Test suites (7 files)
```

## License

MIT
