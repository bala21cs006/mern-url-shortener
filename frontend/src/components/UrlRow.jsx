// src/components/UrlRow.jsx
import { useState } from 'react';

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function UrlRow({ entry, onDelete }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(entry.shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API unavailable — silently ignore.
    }
  }

  return (
    <tr>
      <td className="cell-code">
        <a href={entry.shortUrl} target="_blank" rel="noopener noreferrer">
          {entry.shortUrl.replace(/^https?:\/\//, '')}
        </a>
      </td>
      <td className="cell-original" title={entry.longUrl}>
        {entry.longUrl}
      </td>
      <td className="cell-clicks">{entry.clicks}</td>
      <td className="cell-date">{formatDate(entry.createdAt)}</td>
      <td className="cell-actions">
        <button className="icon-btn" onClick={handleCopy} title="Copy short link">
          {copied ? '✓ Copied' : 'Copy'}
        </button>
        <button
          className="icon-btn icon-btn--danger"
          onClick={() => onDelete(entry.code)}
          title="Delete this link"
        >
          Delete
        </button>
      </td>
    </tr>
  );
}
