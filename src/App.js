import React, { useEffect, useMemo, useRef, useState } from 'react';
import Header from './components/Header';
import WriteArea from './components/WriteArea';
import PastEntries from './components/PastEntries';

const STORAGE_KEY = 'dailyDumpEntries';

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

function App() {
  const [currentDate, setCurrentDate] = useState(getTodayDate());
  const [entries, setEntries] = useState(loadSavedEntries);
  const [showPastEntries, setShowPastEntries] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const importInputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    if (!statusMessage) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setStatusMessage(''), 3000);
    return () => window.clearTimeout(timeoutId);
  }, [statusMessage]);

  function getTodayDate() {
    const today = new Date();
    return today.toISOString().split('T')[0]; 
  }

  function getEntryDates() {
    return Object.keys(entries).sort();
  }

  function handlePreviousDay() {
    const dates = getEntryDates();
    const currentIndex = dates.indexOf(currentDate);

    if (currentIndex > 0) {
      handleDateClick(dates[currentIndex - 1]);
    }
  }

  function handleNextDay() {
    const dates = getEntryDates();
    const currentIndex = dates.indexOf(currentDate);

    if (currentIndex >= 0 && currentIndex < dates.length - 1) {
      handleDateClick(dates[currentIndex + 1]);
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
        onTogglePastEntries={() => setShowPastEntries(!showPastEntries)}
        onNewEntry={handleNewEntry}
        onExportEntries={handleExportEntries}
        onImportEntries={handleImportClick}
        showingPast={showPastEntries}
      />

      {statusMessage && <div className="status-banner">{statusMessage}</div>}
      
      {showPastEntries ? (
        <PastEntries 
          entries={filteredEntries}
          onDateClick={handleDateClick}
          onDelete={handleDelete}
          currentDate={currentDate}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      ) : (
        <WriteArea 
          date={currentDate}
          text={entries[currentDate] || ''}
          onChange={handleTextChange}
          isToday={currentDate === getTodayDate()}
          onPreviousDay={handlePreviousDay}
          onNextDay={handleNextDay}
          canGoNext={currentDate !== getTodayDate()}
        />
      )}
    </div>
  );
}

export default App;