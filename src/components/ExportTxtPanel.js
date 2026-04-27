import React, { useEffect, useMemo, useState } from 'react';

function ExportTxtPanel({ availableDates, onExportRange, onExportAllTxt }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const hasDates = availableDates.length > 0;
  const minDate = hasDates ? availableDates[0] : '';
  const maxDate = hasDates ? availableDates[availableDates.length - 1] : '';

  useEffect(() => {
    if (hasDates) {
      setStartDate((previous) => previous || minDate);
      setEndDate((previous) => previous || maxDate);
    }
  }, [hasDates, minDate, maxDate]);

  const disableRangeExport = useMemo(() => {
    if (!startDate || !endDate) {
      return true;
    }
    return startDate > endDate;
  }, [startDate, endDate]);

  return (
    <section className="export-card">
      <div className="export-header">
        <h2>Text export</h2>
        <p>Download your writing as plain text.</p>
      </div>
      <div className="export-controls">
        <button type="button" className="btn-new" onClick={onExportAllTxt} disabled={!hasDates}>
          export all entries
        </button>
        <label>
          start date
          <input
            type="date"
            value={startDate}
            min={minDate}
            max={maxDate}
            onChange={(event) => setStartDate(event.target.value)}
            disabled={!hasDates}
          />
        </label>
        <label>
          end date
          <input
            type="date"
            value={endDate}
            min={minDate}
            max={maxDate}
            onChange={(event) => setEndDate(event.target.value)}
            disabled={!hasDates}
          />
        </label>
        <button
          type="button"
          className="btn-new"
          onClick={() => onExportRange(startDate, endDate)}
          disabled={disableRangeExport || !hasDates}
        >
          export selected range
        </button>
      </div>
    </section>
  );
}

export default ExportTxtPanel;
