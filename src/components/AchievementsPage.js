import React from 'react';
import BadgeCollection from './BadgeCollection';

function AchievementsPage({ badges, streakStats }) {
  const unlockedCount = badges.filter((badge) => badge.unlocked).length;
  const completionRate = badges.length > 0 ? Math.round((unlockedCount / badges.length) * 100) : 0;

  return (
    <section className="achievements-page">
      <div className="achievements-summary">
        <h2>Achievements</h2>
        <p>Track milestones without cluttering the writing screen.</p>
      </div>

      <div className="achievements-metrics">
        <article>
          <span className="meta-label">Unlocked</span>
          <strong className="metric-value">{unlockedCount}/{badges.length}</strong>
        </article>
        <article>
          <span className="meta-label">Completion</span>
          <strong className="metric-value">{completionRate}%</strong>
        </article>
        <article>
          <span className="meta-label">Best Streak</span>
          <strong className="metric-value">{streakStats.longestStreak} days</strong>
        </article>
        <article>
          <span className="meta-label">Total Entries</span>
          <strong className="metric-value">{streakStats.totalEntries}</strong>
        </article>
      </div>

      <BadgeCollection badges={badges} />
    </section>
  );
}

export default AchievementsPage;
