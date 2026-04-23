import React, { useState, useEffect } from 'react';

function WriteArea({ date, text, onChange, isToday, onPreviousDay, onNextDay, canGoNext }) {
  const [lastSaved, setLastSaved] = useState('');

  useEffect(() => {
    if (text) {
      const now = new Date();
      const time = now.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
      setLastSaved(time);
    }
  }, [text]);

  function formatDate(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  function getWordCount(value) {
    return value.trim() ? value.trim().split(/\s+/).length : 0;
  }

  return (
    <div className="write-area">
      <div className="write-toolbar">
        <button onClick={onPreviousDay} className="toolbar-btn">
          previous
        </button>
        <button onClick={onNextDay} className="toolbar-btn" disabled={!canGoNext}>
          next
        </button>
      </div>

      <div className="date-header">
        <span className="current-date">{formatDate(date)}</span>
        {!isToday && <span className="past-indicator">viewing past entry</span>}
      </div>
      
      <textarea
        value={text}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write anything... no one's judging."
        className="main-textarea"
        autoFocus
      />
      
      <div className="write-meta">
        <div className="save-indicator">
          {lastSaved ? `saved at ${lastSaved}` : 'autosaves locally'}
        </div>
        <div className="entry-stats">
          {text.length} characters · {getWordCount(text)} words
        </div>
      </div>
    </div>
  );
}

export default WriteArea;