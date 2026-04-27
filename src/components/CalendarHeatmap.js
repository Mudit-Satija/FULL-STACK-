import React from 'react';
import { formatLongDate } from '../utils/journalHelpers';

function CalendarHeatmap({ days, onDateClick, currentDate }) {
  return (
    <section className="heatmap-card">
      <div className="heatmap-head">
        <h2>Writing heatmap</h2>
        <p>Last 12 months</p>
      </div>
      <div className="heatmap-wrap">
        <div className="heatmap-grid" role="grid" aria-label="Journal activity heatmap">
          {days.map((day) => (
            <button
              key={day.date}
              type="button"
              className={`heatmap-day level-${day.level} ${day.date === currentDate ? 'active' : ''}`}
              onClick={() => onDateClick(day.date)}
              title={`${formatLongDate(day.date)}: ${day.words} ${day.words === 1 ? 'word' : 'words'}`}
              aria-label={`${formatLongDate(day.date)}, ${day.words} words`}
            />
          ))}
        </div>
      </div>
      <div className="heatmap-legend" aria-hidden="true">
        <span>Less</span>
        <i className="heatmap-day level-0" />
        <i className="heatmap-day level-1" />
        <i className="heatmap-day level-2" />
        <i className="heatmap-day level-3" />
        <i className="heatmap-day level-4" />
        <span>More</span>
      </div>
    </section>
  );
}

export default CalendarHeatmap;
