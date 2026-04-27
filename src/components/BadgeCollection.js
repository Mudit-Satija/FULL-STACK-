import React from 'react';

function BadgeCollection({ badges }) {
  const unlockedCount = badges.filter((badge) => badge.unlocked).length;

  return (
    <section className="badge-card">
      <div className="badge-header">
        <h2>Milestone badges</h2>
        <p>{unlockedCount}/{badges.length} unlocked</p>
      </div>
      <div className="badge-grid">
        {badges.map((badge) => (
          <article
            key={badge.id}
            className={`badge-item ${badge.unlocked ? 'unlocked' : 'locked'}`}
            title={badge.unlocked ? `Unlocked on ${new Date(badge.unlockedAt).toLocaleDateString()}` : 'Locked'}
          >
            <div className="badge-icon" aria-hidden="true">{badge.icon}</div>
            <div className="badge-copy">
              <h3>{badge.title}</h3>
              <p>{badge.description}</p>
              <small>
                {badge.unlocked
                  ? `Achieved ${new Date(badge.unlockedAt).toLocaleDateString()}`
                  : `Locked (${badge.type === 'streak' ? `${badge.threshold} day streak` : `${badge.threshold} entries`})`}
              </small>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default BadgeCollection;
