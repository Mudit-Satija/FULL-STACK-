import React, { useEffect, useMemo, useRef, useState } from 'react';
import Header from './components/Header';
import WriteArea from './components/WriteArea';
import PastEntries from './components/PastEntries';
import StreakDisplay from './components/StreakDisplay';
import AchievementsPage from './components/AchievementsPage';
import CalendarHeatmap from './components/CalendarHeatmap';
import ExportTxtPanel from './components/ExportTxtPanel';
import {
  buildBadgeState,
  buildHeatmapData,
  buildTxtDocumentFromEntries,
  calculateStreakStats,
  getTodayDate,
  sanitizeDateRange
} from './utils/journalHelpers';

const STORAGE_KEY = 'dailyDumpEntries';
const STREAK_STORAGE_KEY = 'dailyDumpStreak';
const BADGE_STORAGE_KEY = 'dailyDumpBadges';
const THEME_STORAGE_KEY = 'dailyDumpTheme';

function loadSavedEntries() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : {};
    const normalized = sanitizeImportedEntries(parsed);
    return normalized || {};
  } catch (error) {
    console.error('Failed to load saved entries:', error);
    return {};
  }
}

function sanitizeImportedEntries(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return null;
  }

  const source = payload.entries && typeof payload.entries === 'object' ? payload.entries : payload;

  const cleanedEntries = Object.entries(source).reduce((accumulator, [date, value]) => {
    if (typeof date === 'string' && typeof value === 'string') {
      accumulator[date] = value;
    }
    return accumulator;
  }, {});

  return cleanedEntries;
}

function getStoredJson(key, fallbackValue) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallbackValue;
  } catch (error) {
    return fallbackValue;
  }
}

function getPreferredTheme() {
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);

  if (storedTheme === 'dark' || storedTheme === 'light') {
    return storedTheme;
  }

  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  return 'light';
}

function downloadTextFile(fileName, content) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(downloadUrl);
}

function App() {
  const [activePage, setActivePage] = useState('journal');
  const [currentDate, setCurrentDate] = useState(getTodayDate());
  const [entries, setEntries] = useState(loadSavedEntries);
  const [streakStats, setStreakStats] = useState(() => getStoredJson(STREAK_STORAGE_KEY, {
    currentStreak: 0,
    longestStreak: 0,
    totalEntries: 0,
    lastEntryDate: null,
    activeDates: []
  }));
  const [badgeProgress, setBadgeProgress] = useState(() => getStoredJson(BADGE_STORAGE_KEY, {}));
  const [theme, setTheme] = useState(getPreferredTheme);
  const [showPastEntries, setShowPastEntries] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const importInputRef = useRef(null);

  const entryDates = useMemo(() => Object.keys(entries).sort(), [entries]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    const nextStreakStats = calculateStreakStats(entries);
    setStreakStats(nextStreakStats);
    localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(nextStreakStats));

    setBadgeProgress((previous) => {
      const { unlockedMap } = buildBadgeState(previous, nextStreakStats);

      if (JSON.stringify(previous) === JSON.stringify(unlockedMap)) {
        return previous;
      }

      return unlockedMap;
    });
  }, [entries]);

  useEffect(() => {
    localStorage.setItem(BADGE_STORAGE_KEY, JSON.stringify(badgeProgress));
  }, [badgeProgress]);

  useEffect(() => {
    if (!statusMessage) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setStatusMessage(''), 3000);
    return () => window.clearTimeout(timeoutId);
  }, [statusMessage]);

  function handlePreviousDay() {
    const currentIndex = entryDates.indexOf(currentDate);

    if (currentIndex > 0) {
      handleDateClick(entryDates[currentIndex - 1]);
    }
  }

  function handleNextDay() {
    const currentIndex = entryDates.indexOf(currentDate);

    if (currentIndex >= 0 && currentIndex < entryDates.length - 1) {
      handleDateClick(entryDates[currentIndex + 1]);
      return;
    }

    if (currentDate !== getTodayDate()) {
      handleDateClick(getTodayDate());
    }
  }

  function handleTextChange(text) {
    setEntries(prev => ({
      ...prev,
      [currentDate]: text
    }));
  }

  function handleDateClick(date) {
    setCurrentDate(date);
    setShowPastEntries(false);
    setSearchQuery('');
    setActivePage('journal');
  }

  function handleToggleTheme() {
    setTheme((previousTheme) => (previousTheme === 'dark' ? 'light' : 'dark'));
  }

  function handleDelete(date) {
    const updated = { ...entries };
    delete updated[date];
    setEntries(updated);
    
    if (date === currentDate) {
      setCurrentDate(getTodayDate());
    }
  }

  function handleNewEntry() {
    setCurrentDate(getTodayDate());
    setShowPastEntries(false);
    setSearchQuery('');
    setActivePage('journal');
  }

  function handleTogglePastEntries() {
    const nextShowPastEntries = !showPastEntries;
    setActivePage('journal');
    setShowPastEntries(nextShowPastEntries);

    if (!nextShowPastEntries) {
      setSearchQuery('');
    }
  }

  function handleGoToJournal() {
    setActivePage('journal');
  }

  function handleGoToAchievements() {
    setActivePage('achievements');
    setShowPastEntries(false);
    setSearchQuery('');
  }

  function handleExportEntries() {
    const exportData = JSON.stringify({
      version: 1,
      exportedAt: new Date().toISOString(),
      entries
    }, null, 2);

    const blob = new Blob([exportData], { type: 'application/json' });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `daily-dump-backup-${getTodayDate()}.json`;
    link.click();
    URL.revokeObjectURL(downloadUrl);
    setStatusMessage('Backup exported.');
  }

  function handleExportCurrentEntryTxt() {
    const content = buildTxtDocumentFromEntries(entries, [currentDate]);
    downloadTextFile(`entry-${currentDate}.txt`, content);
    setStatusMessage(`Exported ${currentDate} as TXT.`);
  }

  function handleExportAllEntriesTxt() {
    if (entryDates.length === 0) {
      setStatusMessage('No entries available for TXT export.');
      return;
    }

    const content = buildTxtDocumentFromEntries(entries, entryDates);
    downloadTextFile(`daily-dump-all-${getTodayDate()}.txt`, content);
    setStatusMessage(`Exported ${entryDates.length} entries as TXT.`);
  }

  function handleExportRangeTxt(startDate, endDate) {
    if (entryDates.length === 0) {
      setStatusMessage('No entries available for TXT export.');
      return;
    }

    const range = sanitizeDateRange(startDate, endDate);

    if (!range) {
      setStatusMessage('Invalid date range.');
      return;
    }

    const selectedDates = entryDates.filter((date) => date >= range.startDate && date <= range.endDate);

    if (selectedDates.length === 0) {
      setStatusMessage('No entries found in that range.');
      return;
    }

    const content = buildTxtDocumentFromEntries(entries, selectedDates);
    downloadTextFile(`daily-dump-${range.startDate}-to-${range.endDate}.txt`, content);
    setStatusMessage(`Exported ${selectedDates.length} entries as TXT.`);
  }

  function handleImportClick() {
    if (importInputRef.current) {
      importInputRef.current.click();
    }
  }

  function handleImportFileChange(event) {
    const file = event.target.files && event.target.files[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        const importedEntries = sanitizeImportedEntries(parsed);

        if (!importedEntries) {
          setStatusMessage('Import failed: invalid file format.');
          return;
        }

        setEntries(importedEntries);
        const importedDates = Object.keys(importedEntries).sort();
        setCurrentDate(importedDates[importedDates.length - 1] || getTodayDate());
        setShowPastEntries(true);
        setStatusMessage(`Imported ${importedDates.length} entries.`);
      } catch (error) {
        setStatusMessage('Import failed: could not read JSON.');
      }
    };

    reader.readAsText(file);
  }

  const filteredEntries = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return entries;
    }

    return Object.entries(entries).reduce((accumulator, [date, text]) => {
      if (date.toLowerCase().includes(normalizedQuery) || text.toLowerCase().includes(normalizedQuery)) {
        accumulator[date] = text;
      }
      return accumulator;
    }, {});
  }, [entries, searchQuery]);

  const badgeState = useMemo(() => buildBadgeState(badgeProgress, streakStats), [badgeProgress, streakStats]);
  const heatmapDays = useMemo(() => buildHeatmapData(entries), [entries]);

  return (
    <div className="app">
      <input
        ref={importInputRef}
        type="file"
        accept="application/json,.json"
        className="visually-hidden"
        onChange={handleImportFileChange}
      />
      <Header
        activePage={activePage}
        onGoToJournal={handleGoToJournal}
        onGoToAchievements={handleGoToAchievements}
        onTogglePastEntries={handleTogglePastEntries}
        onNewEntry={handleNewEntry}
        onExportEntries={handleExportEntries}
        onImportEntries={handleImportClick}
        onToggleTheme={handleToggleTheme}
        theme={theme}
        showingPast={showPastEntries}
      />

      {statusMessage && <div className="status-banner">{statusMessage}</div>}

      {activePage === 'achievements' ? (
        <AchievementsPage badges={badgeState.badges} streakStats={streakStats} />
      ) : (
        <>
          <div className="insights-grid">
            <StreakDisplay
              currentStreak={streakStats.currentStreak}
              longestStreak={streakStats.longestStreak}
              totalEntries={streakStats.totalEntries}
            />
          </div>

          <CalendarHeatmap
            days={heatmapDays}
            currentDate={currentDate}
            onDateClick={handleDateClick}
          />

          <ExportTxtPanel
            availableDates={entryDates}
            onExportRange={handleExportRangeTxt}
            onExportAllTxt={handleExportAllEntriesTxt}
          />

          {showPastEntries ? (
            <PastEntries
              entries={filteredEntries}
              onDateClick={handleDateClick}
              onDelete={handleDelete}
              currentDate={currentDate}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onClearSearch={() => setSearchQuery('')}
              onBackToWriting={() => {
                setShowPastEntries(false);
                setSearchQuery('');
              }}
            />
          ) : (
            <WriteArea
              date={currentDate}
              text={entries[currentDate] || ''}
              onChange={handleTextChange}
              onExportCurrentTxt={handleExportCurrentEntryTxt}
              isToday={currentDate === getTodayDate()}
              onPreviousDay={handlePreviousDay}
              onNextDay={handleNextDay}
              canGoNext={currentDate !== getTodayDate()}
            />
          )}
        </>
      )}
    </div>
  );
}

export default App;