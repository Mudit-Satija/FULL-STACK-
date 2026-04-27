export const BADGE_DEFINITIONS = [
  {
    id: 'first-entry',
    icon: '🌱',
    title: 'First Entry',
    description: 'Write your first journal entry.',
    type: 'entries',
    threshold: 1
  },
  {
    id: 'week-of-entries',
    icon: '📝',
    title: '7 Entries',
    description: 'Write 7 total entries.',
    type: 'entries',
    threshold: 7
  },
  {
    id: 'month-of-entries',
    icon: '📚',
    title: '30 Entries',
    description: 'Write 30 total entries.',
    type: 'entries',
    threshold: 30
  },
  {
    id: 'getting-started',
    icon: '🚀',
    title: 'Getting Started',
    description: 'Reach a 3 day writing streak.',
    type: 'streak',
    threshold: 3
  },
  {
    id: 'one-week-warrior',
    icon: '🔥',
    title: 'One Week Warrior',
    description: 'Reach a 7 day writing streak.',
    type: 'streak',
    threshold: 7
  },
  {
    id: 'two-week-champion',
    icon: '🏅',
    title: 'Two Week Champion',
    description: 'Reach a 14 day writing streak.',
    type: 'streak',
    threshold: 14
  },
  {
    id: 'monthly-master',
    icon: '📅',
    title: 'Monthly Master',
    description: 'Reach a 30 day writing streak.',
    type: 'streak',
    threshold: 30
  },
  {
    id: 'sixty-day-builder',
    icon: '🧱',
    title: 'Sixty Day Builder',
    description: 'Reach a 60 day writing streak.',
    type: 'streak',
    threshold: 60
  },
  {
    id: 'hundred-day-run',
    icon: '⚡',
    title: 'Hundred Day Run',
    description: 'Reach a 100 day writing streak.',
    type: 'streak',
    threshold: 100
  },
  {
    id: 'quarter-centurion',
    icon: '💯',
    title: 'Quarter Centurion',
    description: 'Write 100 total entries.',
    type: 'entries',
    threshold: 100
  },
  {
    id: 'double-century-writer',
    icon: '🥈',
    title: 'Double Century',
    description: 'Write 200 total entries.',
    type: 'entries',
    threshold: 200
  },
  {
    id: 'five-hundred-club',
    icon: '🏆',
    title: '500 Club',
    description: 'Write 500 total entries.',
    type: 'entries',
    threshold: 500
  },
  {
    id: 'half-year-hero',
    icon: '🛡️',
    title: 'Half Year Hero',
    description: 'Reach a 180 day writing streak.',
    type: 'streak',
    threshold: 180
  },
  {
    id: 'year-long-legend',
    icon: '👑',
    title: 'Year Long Legend',
    description: 'Reach a 365 day writing streak.',
    type: 'streak',
    threshold: 365
  }
];

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export function getWordCount(text) {
  return text && text.trim() ? text.trim().split(/\s+/).length : 0;
}

export function getTodayDate() {
  return formatDateKey(new Date());
}

export function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateKey(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(dateKey, days) {
  const date = parseDateKey(dateKey);
  date.setDate(date.getDate() + days);
  return formatDateKey(date);
}

export function differenceInDays(fromDateKey, toDateKey) {
  const from = parseDateKey(fromDateKey);
  const to = parseDateKey(toDateKey);
  const fromUtc = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const toUtc = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.floor((toUtc - fromUtc) / DAY_IN_MS);
}

export function getActiveEntries(entries) {
  return Object.entries(entries).reduce((accumulator, [date, text]) => {
    const words = getWordCount(text);
    if (words > 0) {
      accumulator[date] = {
        text,
        words
      };
    }
    return accumulator;
  }, {});
}

export function calculateStreakStats(entries) {
  const activeEntries = getActiveEntries(entries);
  const activeDates = Object.keys(activeEntries).sort();

  if (activeDates.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalEntries: 0,
      lastEntryDate: null,
      activeDates
    };
  }

  let longestStreak = 1;
  let runningStreak = 1;

  for (let index = 1; index < activeDates.length; index += 1) {
    const previousDate = activeDates[index - 1];
    const currentDate = activeDates[index];

    if (differenceInDays(previousDate, currentDate) === 1) {
      runningStreak += 1;
      if (runningStreak > longestStreak) {
        longestStreak = runningStreak;
      }
    } else {
      runningStreak = 1;
    }
  }

  const today = getTodayDate();
  const lastEntryDate = activeDates[activeDates.length - 1];
  const gapFromToday = differenceInDays(lastEntryDate, today);

  let currentStreak = 0;

  // A streak remains valid through yesterday; older gaps reset it to zero.
  if (gapFromToday <= 1) {
    currentStreak = 1;

    for (let index = activeDates.length - 1; index > 0; index -= 1) {
      const previousDate = activeDates[index - 1];
      const currentDate = activeDates[index];

      if (differenceInDays(previousDate, currentDate) === 1) {
        currentStreak += 1;
      } else {
        break;
      }
    }
  }

  return {
    currentStreak,
    longestStreak,
    totalEntries: activeDates.length,
    lastEntryDate,
    activeDates
  };
}

export function buildBadgeState(savedBadgeState, streakStats) {
  const now = new Date().toISOString();

  const unlockedMap = BADGE_DEFINITIONS.reduce((accumulator, badge) => {
    const saved = savedBadgeState && savedBadgeState[badge.id];

    if (saved && saved.unlockedAt) {
      accumulator[badge.id] = saved;
      return accumulator;
    }

    // Persist the first unlock timestamp and avoid overwriting existing badges.
    const meetsRequirement = badge.type === 'streak'
      ? streakStats.longestStreak >= badge.threshold
      : streakStats.totalEntries >= badge.threshold;

    if (meetsRequirement) {
      accumulator[badge.id] = {
        unlockedAt: now
      };
    }

    return accumulator;
  }, {});

  const badges = BADGE_DEFINITIONS.map((badge) => {
    const state = unlockedMap[badge.id];
    return {
      ...badge,
      unlocked: Boolean(state && state.unlockedAt),
      unlockedAt: state ? state.unlockedAt : null
    };
  });

  return {
    unlockedMap,
    badges
  };
}

export function getHeatmapLevel(wordCount) {
  if (wordCount === 0) {
    return 0;
  }
  if (wordCount <= 50) {
    return 1;
  }
  if (wordCount <= 150) {
    return 2;
  }
  if (wordCount <= 300) {
    return 3;
  }
  return 4;
}

export function buildHeatmapData(entries) {
  const activeEntries = getActiveEntries(entries);
  const today = getTodayDate();
  const firstDate = addDays(today, -364);
  const days = [];

  // Build a continuous 365-day window so empty days are rendered as level 0.
  for (let offset = 0; offset < 365; offset += 1) {
    const date = addDays(firstDate, offset);
    const activity = activeEntries[date];
    const words = activity ? activity.words : 0;

    days.push({
      date,
      words,
      level: getHeatmapLevel(words),
      hasEntry: words > 0
    });
  }

  return days;
}

export function formatLongDate(dateKey) {
  return parseDateKey(dateKey).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

export function sortDateKeysDescending(entries) {
  return Object.keys(entries).sort().reverse();
}

export function buildTxtDocumentFromEntries(entryMap, orderedDates) {
  return orderedDates
    .map((date) => {
      const content = entryMap[date] || '';
      return `${date}\n${'='.repeat(24)}\n${content.trim() || '(empty entry)'}\n`;
    })
    .join('\n');
}

export function sanitizeDateRange(startDate, endDate) {
  if (!startDate || !endDate) {
    return null;
  }

  if (startDate > endDate) {
    return null;
  }

  return {
    startDate,
    endDate
  };
}
