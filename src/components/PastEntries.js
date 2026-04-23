import React from 'react';

function PastEntries({ entries, onDateClick, onDelete, currentDate, searchQuery, onSearchChange }) {
  const sortedDates = Object.keys(entries).sort().reverse();

  function formatDate(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }

  function getPreview(text) {
    if (!text) return 'empty entry';
    return text.slice(0, 80) + (text.length > 80 ? '...' : '');
  }

  if (sortedDates.length === 0) {
    return (
      <div className="past-entries">
        <h2>Past Entries</h2>
        <p className="empty-state">
          {searchQuery ? `No matches for “${searchQuery}”.` : 'No entries yet. Start writing!'}
        </p>
      </div>
    );
  }

  return (
    <div className="past-entries">
      <div className="past-header">
        <h2>Past Entries</h2>
        <p>{sortedDates.length} saved {sortedDates.length === 1 ? 'entry' : 'entries'}</p>
      </div>
      <input
        type="search"
        className="entries-search"
        placeholder="Search dates or text"
        value={searchQuery}
        onChange={(event) => onSearchChange(event.target.value)}
      />

      <div className="entries-list">
        {sortedDates.map(date => (
          <div 
            key={date} 
            className={`entry-item ${date === currentDate ? 'active' : ''}`}
          >
            <div className="entry-content" onClick={() => onDateClick(date)}>
              <div className="entry-date">{formatDate(date)}</div>
              <div className="entry-preview">{getPreview(entries[date])}</div>
            </div>
            <button 
              className="delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm('Delete this entry?')) {
                  onDelete(date);
                }
              }}
            >
              delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PastEntries;