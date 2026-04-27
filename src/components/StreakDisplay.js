import React from 'react';

function StreakDisplay({ currentStreak, longestStreak, totalEntries }) {
  return (
    <section className="streak-card">
      <div className="streak-title-row">
        <h2>Days in a row</h2>
        <span className="streak-flame" aria-hidden="true">🔥</span>
      </div>
      <p className="streak-current">{currentStreak}</p>
      <p className="streak-subtitle">Current writing streak</p>
      <div className="streak-meta">
        <div>
          <span className="meta-label">Longest</span>
          <span className="meta-value">{longestStreak} days</span>
        </div>
        <div>
          <span className="meta-label">Entries</span>
          <span className="meta-value">{totalEntries}</span>
        </div>
      </div>
    </section>
  );
}

export default StreakDisplay;
