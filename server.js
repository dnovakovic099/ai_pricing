/**
 * Production Server for AI Pricing Dashboard
 * Serves the static Vite build and proxies API requests to the backend
 */

import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// API URL - defaults to Railway production server
const API_URL = process.env.API_URL || 'https://roomify-server-production.up.railway.app';

console.log(`🚀 Starting AI Pricing Dashboard`);
console.log(`📡 API URL: ${API_URL}`);

// Proxy API requests to backend
app.use('/api', createProxyMiddleware({
  target: API_URL,
  changeOrigin: true,
  secure: true,
  onProxyReq: (proxyReq, req) => {
    console.log(`[Proxy] ${req.method} ${req.url} -> ${API_URL}${req.url}`);
  },
  onError: (err, req, res) => {
    console.error(`[Proxy Error] ${err.message}`);
    res.status(502).json({ error: 'Backend server unavailable' });
  }
}));

// Serve static files from the Vite build
app.use(express.static(join(__dirname, 'dist')));

// Handle SPA routing - serve index.html for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Dashboard running on port ${PORT}`);
  console.log(`   Local: http://localhost:${PORT}`);
});

