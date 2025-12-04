/**
 * Simple static file server for AI Pricing Dashboard
 * Frontend calls the backend API directly (no proxy needed)
 */

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

console.log(`🚀 Starting AI Pricing Dashboard`);

// Serve static files from the Vite build
app.use(express.static(path.join(__dirname, 'dist')));

// Handle SPA routing - serve index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Dashboard running on port ${PORT}`);
});
