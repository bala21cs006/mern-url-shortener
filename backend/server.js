// server.js — Express app entry point
require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const apiRoutes = require('./routes/api');
const { redirectToLongUrl } = require('./controllers/urlController');

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

// --- API ---
app.use('/api', apiRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// --- Serve the built React app in production ---
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendDist));

// --- Redirect route: GET /:code ---
// Placed after static assets so real files are served first, and it only
// catches short codes that don't match a file or an /api route.
// Also accepts an optional trailing slash (e.g. "/aB3xY9/") so a stray slash
// from copy/paste or a browser autocomplete doesn't silently 404.
app.get('/:code([^/]+)/?', (req, res, next) => {
  if (req.params.code.includes('.')) return next(); // let static/404 handle real files
  return redirectToLongUrl(req, res);
});

const fs = require('fs');
const distExists = fs.existsSync(path.join(frontendDist, 'index.html'));

// --- Fallback: serve the React app for any other route (client-side routing) ---
app.use((req, res) => {
  if (!distExists) {
    // Dev mode: the frontend isn't built into backend/../frontend/dist yet.
    // This branch is hit for the bare root ("/") or any path that isn't a
    // real short code — e.g. visiting http://localhost:5000/ directly.
    // In dev, the React app runs separately on http://localhost:5173.
    return res.status(404).json({
      error: 'Not found.',
      hint:
        req.path === '/'
          ? 'Backend is running correctly. Open http://localhost:5173 in your browser for the app (dev mode), or use a full short link like http://localhost:5000/<code>.'
          : `No short link with code "${req.path.slice(1)}" exists, and no built frontend was found at frontend/dist. Run "npm run build:frontend" for production mode, or use http://localhost:5173 in dev mode.`,
    });
  }
  res.sendFile(path.join(frontendDist, 'index.html'), (err) => {
    if (err) res.status(404).json({ error: 'Not found.' });
  });
});

app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});
