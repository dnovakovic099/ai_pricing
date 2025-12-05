# AI Pricing Dashboard

A real-time market analysis dashboard for vacation rental pricing optimization.

## Features

- 📊 **Market Analysis** - View competitor pricing data across all your listings
- 💰 **ADR Tracking** - Average Daily Rate by weekday (enhanced with PMS booking data when available)
- 🤖 **AI Recommendations** - Smart pricing suggestions based on market data
- 📅 **Date Chunks** - Analyze available date ranges with competitor pricing

> **Note:** Core pricing features work without any PMS integration! ADR tracking is enhanced when connected to your property management system.

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

Create a `.env` file in the project root:

```bash
# API Configuration
VITE_API_URL=https://roomify-server-production.up.railway.app/api

# Auth Credentials (required)
VITE_AUTH_EMAIL=your-email@example.com
VITE_AUTH_PASSWORD=your-password
```

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API URL | No (has default) |
| `VITE_AUTH_EMAIL` | Login email | **Yes** |
| `VITE_AUTH_PASSWORD` | Login password | **Yes** |
| `PORT` | Server port (production) | No (default: 3000) |

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
