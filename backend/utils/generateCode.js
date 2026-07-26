// utils/generateCode.js — generates unique base62 short codes
const { customAlphabet } = require('nanoid');
const Url = require('../models/Url');

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const DEFAULT_LENGTH = 6;

/**
 * Generate a random short code that does not already exist in the database.
 * Retries a handful of times, then grows the code length as a last resort
 * to guarantee termination.
 */
async function generateUniqueCode(length = DEFAULT_LENGTH, attempts = 10) {
  const nanoid = customAlphabet(ALPHABET, length);

  for (let i = 0; i < attempts; i++) {
    const code = nanoid();
    const exists = await Url.exists({ code });
    if (!exists) return code;
  }

  // Collision space exhausted at this length (astronomically unlikely) — grow it.
  return generateUniqueCode(length + 1, attempts);
}

module.exports = generateUniqueCode;
