import React from 'react';

function Header({
  activePage,
  onGoToJournal,
  onGoToAchievements,
  onTogglePastEntries,
  onNewEntry,
  onExportEntries,
  onImportEntries,
  onToggleTheme,
  theme,
  showingPast
}) {
  return (
    <div className="header">
      <div className="header-copy">
        <h1>Daily Dump</h1>
        <p>Capture your day, revisit entries, and keep local backups.</p>
      </div>
      <div className="header-nav" role="tablist" aria-label="Main pages">
        <button
          type="button"
          role="tab"
          aria-selected={activePage === 'journal'}
          className={`nav-pill ${activePage === 'journal' ? 'active' : ''}`}
          onClick={onGoToJournal}
        >
          journal
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activePage === 'achievements'}
          className={`nav-pill ${activePage === 'achievements' ? 'active' : ''}`}
          onClick={onGoToAchievements}
        >
          achievements
        </button>
      </div>
      <div className="header-buttons">
        <button type="button" onClick={onToggleTheme} className="btn-secondary" title="Toggle light and dark mode">
          {theme === 'dark' ? 'light mode' : 'dark mode'}
        </button>
        <button type="button" onClick={onImportEntries} className="btn-secondary">
          import
        </button>
        <button type="button" onClick={onExportEntries} className="btn-secondary">
          export json
        </button>
        {activePage === 'journal' && (
          <>
            <button type="button" onClick={onNewEntry} className="btn-new">
              today
            </button>
            <button type="button" onClick={onTogglePastEntries} className="btn-past">
              {showingPast ? 'back to writing' : 'past entries'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default Header;