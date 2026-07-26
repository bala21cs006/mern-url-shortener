// routes/api.js — /api/urls routes
const express = require('express');
const router = express.Router();
const {
  createShortUrl,
  listShortUrls,
  deleteShortUrl,
} = require('../controllers/urlController');

router.post('/urls', createShortUrl);
router.get('/urls', listShortUrls);
router.delete('/urls/:code', deleteShortUrl);

module.exports = router;
