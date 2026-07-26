// controllers/urlController.js — request handlers for URL shortening
const Url = require('../models/Url');
const validateUrl = require('../utils/validateUrl');
const generateUniqueCode = require('../utils/generateCode');

function getBaseUrl(req) {
  return process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
}

function toPublicShape(doc, baseUrl) {
  return {
    id: doc._id,
    code: doc.code,
    longUrl: doc.longUrl,
    shortUrl: `${baseUrl}/${doc.code}`,
    clicks: doc.clicks,
    createdAt: doc.createdAt,
  };
}

/** POST /api/urls — create a new short URL (or return the existing one). */
async function createShortUrl(req, res) {
  try {
    const { url } = req.body || {};
    const check = validateUrl(url);

    if (!check.valid) {
      return res.status(400).json({ error: check.error });
    }

    const baseUrl = getBaseUrl(req);

    // Prevent duplicates: if this long URL was already shortened, return it as-is.
    const existing = await Url.findOne({ longUrl: check.url });
    if (existing) {
      return res.status(200).json({ ...toPublicShape(existing, baseUrl), duplicate: true });
    }

    const code = await generateUniqueCode();
    const created = await Url.create({ code, longUrl: check.url });

    return res.status(201).json(toPublicShape(created, baseUrl));
  } catch (err) {
    // Handle a rare race condition on the unique index gracefully.
    if (err.code === 11000) {
      const existing = await Url.findOne({ longUrl: req.body.url });
      if (existing) {
        return res.status(200).json({ ...toPublicShape(existing, getBaseUrl(req)), duplicate: true });
      }
    }
    console.error('createShortUrl error:', err);
    return res.status(500).json({ error: 'Something went wrong while creating the short URL.' });
  }
}

/** GET /api/urls — list every shortened URL, most recent first. */
async function listShortUrls(req, res) {
  try {
    const baseUrl = getBaseUrl(req);
    const docs = await Url.find().sort({ createdAt: -1 });
    return res.json(docs.map((d) => toPublicShape(d, baseUrl)));
  } catch (err) {
    console.error('listShortUrls error:', err);
    return res.status(500).json({ error: 'Something went wrong while fetching URLs.' });
  }
}

/** DELETE /api/urls/:code — remove a short URL. */
async function deleteShortUrl(req, res) {
  try {
    const result = await Url.findOneAndDelete({ code: req.params.code });
    if (!result) {
      return res.status(404).json({ error: 'Short code not found.' });
    }
    return res.status(204).end();
  } catch (err) {
    console.error('deleteShortUrl error:', err);
    return res.status(500).json({ error: 'Something went wrong while deleting the URL.' });
  }
}

/** GET /:code — redirect to the original URL and record a click. */
async function redirectToLongUrl(req, res) {
  try {
    const { code } = req.params;
    const doc = await Url.findOneAndUpdate(
      { code },
      { $inc: { clicks: 1 } },
      { new: false }
    );

    if (!doc) {
      return res.status(404).json({ error: 'Short link not found.' });
    }

    return res.redirect(302, doc.longUrl);
  } catch (err) {
    console.error('redirectToLongUrl error:', err);
    return res.status(500).json({ error: 'Something went wrong while redirecting.' });
  }
}

module.exports = {
  createShortUrl,
  listShortUrls,
  deleteShortUrl,
  redirectToLongUrl,
};
