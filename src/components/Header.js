import React from 'react';

function Header({ onTogglePastEntries, onNewEntry, onExportEntries, onImportEntries, showingPast }) {
  return (
    <div className="header">
      <div className="header-copy">
        <h1>Daily Dump</h1>
        <p>Capture notes, browse history, and keep a local backup.</p>
      </div>
      <div className="header-buttons">
        <button onClick={onNewEntry} className="btn-new">
          today
        </button>
        <button onClick={onTogglePastEntries} className="btn-past">
          {showingPast ? 'back to writing' : 'past entries'}
        </button>
        <button onClick={onImportEntries} className="btn-secondary">
          import
        </button>
        <button onClick={onExportEntries} className="btn-secondary">
          export
        </button>
      </div>
    </div>
  );
}

export default Header;