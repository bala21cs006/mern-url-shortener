
import { useEffect, useState, useCallback } from 'react';
import ShortenForm from './components/ShortenForm.jsx';
import UrlList from './components/UrlList.jsx';
import { fetchUrls, deleteShortUrl } from './api.js';
import './App.css';

export default function App() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchUrls();
      setEntries(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function handleCreated(newEntry) {
    setEntries((prev) => {
      const withoutDupe = prev.filter((e) => e.code !== newEntry.code);
      return [newEntry, ...withoutDupe];
    });
  }

  async function handleDelete(code) {
    const prev = entries;
    setEntries((e) => e.filter((entry) => entry.code !== code));
    try {
      await deleteShortUrl(code);
    } catch (err) {
      setError(err.message);
      setEntries(prev); // revert on failure
    }
  }

  return (
    <div className="page">
      <header className="hero">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            ✂︎
          </span>
          <span className="brand-name">Snip</span>
        </div>
        <h1>Turn long links into short ones</h1>
        <p className="subtitle">Paste a URL below. Get a short, shareable link back instantly.</p>
        <ShortenForm onCreated={handleCreated} />
      </header>

      <main className="content">
        <div className="content-header">
          <h2>Your links</h2>
          <button className="ghost-btn" onClick={load} disabled={loading}>
            ↻ Refresh
          </button>
        </div>

        {error && <p className="form-status form-status--error">{error}</p>}

        <UrlList entries={entries} loading={loading} onDelete={handleDelete} />
      </main>

      <footer className="footer">
        <p>MERN stack — MongoDB, Express, React &amp; Node.js</p>
      </footer>
    </div>
  );
}
