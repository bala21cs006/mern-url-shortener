// utils/validateUrl.js — validates and normalizes a submitted URL

const BLOCKED_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0', '::1']);

/**
 * Validate that a string is a well-formed, safe http(s) URL.
 * Returns { valid: true, url } or { valid: false, error }.
 */
function validateUrl(input) {
  if (!input || typeof input !== 'string') {
    return { valid: false, error: 'A URL is required.' };
  }

  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: 'A URL is required.' };
  }

  if (trimmed.length > 2048) {
    return { valid: false, error: 'URL is too long (max 2048 characters).' };
  }

  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { valid: false, error: 'That is not a valid URL.' };
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return { valid: false, error: 'Only http:// and https:// URLs are allowed.' };
  }

  if (!parsed.hostname || !parsed.hostname.includes('.')) {
    return { valid: false, error: 'The URL must have a valid domain.' };
  }

  if (BLOCKED_HOSTS.has(parsed.hostname.toLowerCase())) {
    return { valid: false, error: 'URLs pointing to local/internal hosts are not allowed.' };
  }

  return { valid: true, url: parsed.toString() };
}

module.exports = validateUrl;
