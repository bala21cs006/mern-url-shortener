// src/components/UrlList.jsx
import UrlRow from './UrlRow.jsx';

export default function UrlList({ entries, loading, onDelete }) {
  if (loading) {
    return <p className="list-status">Loading your links…</p>;
  }

  if (!entries.length) {
    return (
      <div className="empty-state">
        <p>No links yet. Paste a URL above to create your first short link.</p>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table className="urls-table">
        <thead>
          <tr>
            <th>Short link</th>
            <th>Original URL</th>
            <th>Clicks</th>
            <th>Created</th>
            <th aria-label="Actions"></th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <UrlRow key={entry.code} entry={entry} onDelete={onDelete} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
