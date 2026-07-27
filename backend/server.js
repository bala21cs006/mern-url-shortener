
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


const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendDist));


app.get('/:code([^/]+)/?', (req, res, next) => {
  if (req.params.code.includes('.')) return next(); 
  return redirectToLongUrl(req, res);
});

const fs = require('fs');
const distExists = fs.existsSync(path.join(frontendDist, 'index.html'));


app.use((req, res) => {
  if (!distExists) {
   
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
