// src/components/ShortenForm.jsx
import { useState } from 'react';
import { createShortUrl } from '../api.js';

export default function ShortenForm({ onCreated }) {
  const [value, setValue] = useState('');
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!value.trim()) {
      setStatus({ type: 'error', message: 'Paste a URL first.' });
      return;
    }

    setLoading(true);
    setStatus({ type: 'idle', message: '' });

    try {
      const result = await createShortUrl(value.trim());
      onCreated(result);
      setStatus({
        type: 'success',
        message: result.duplicate
          ? 'Already shortened — here is your existing link.'
          : 'Short link created.',
      });
      setValue('');
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="shorten-form" onSubmit={handleSubmit} autoComplete="off">
      <div className="shorten-form__row">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="https://example.com/a/very/long/path?with=params"
          aria-label="Long URL"
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Snipping…' : 'Snip it'}
        </button>
      </div>
      {status.message && (
        <p className={`form-status form-status--${status.type}`} role="status">
          {status.message}
        </p>
      )}
    </form>
  );
}
