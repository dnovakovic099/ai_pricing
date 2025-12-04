# AI Pricing Dashboard

A real-time market analysis dashboard for vacation rental pricing optimization.

## Features

- 📊 **Market Analysis** - View competitor pricing data across all your listings
- 💰 **ADR Tracking** - Average Daily Rate by weekday from actual Hostify bookings
- 🤖 **AI Recommendations** - Smart pricing suggestions based on market data
- 📅 **Date Chunks** - Analyze available date ranges with competitor pricing

## Tech Stack

- **Frontend**: React 19 + Vite
- **Styling**: CSS with dark theme
- **Charts**: Recharts
- **Backend**: Express proxy to Roomify API

## Local Development

```bash
# Install dependencies
npm install

# Start development server (with API proxy)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment (Railway)

1. Push to GitHub
2. Connect repo to Railway
3. Set environment variable:
   - `API_URL` = your backend API URL (defaults to production)
4. Deploy!

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `API_URL` | Backend API URL | https://roomify-server-production.up.railway.app |

## Project Structure

```
├── src/
│   ├── pages/           # Page components
│   ├── services/        # API services
│   ├── App.jsx          # Main app component
│   └── main.jsx         # Entry point
├── server.js            # Production Express server
├── railway.toml         # Railway configuration
└── vite.config.js       # Vite configuration
```
