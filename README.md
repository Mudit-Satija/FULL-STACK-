# Daily Dump

Daily Dump is a small React journaling app for writing short daily notes, browsing past entries, and keeping a local backup in the browser.

## Features

- Write and autosave entries by date
- Move between today and previous days
- Browse past entries with search
- Import and export entries as JSON
- Store data locally in the browser

## Development

Install dependencies:

```bash
npm install
```

Start the app in development mode:

```bash
npm start
```

Create a production build:

```bash
npm run build
```

## Project Structure

- `src/App.js` - main app state and entry management
- `src/components/Header.js` - top-level controls
- `src/components/WriteArea.js` - editor for the current entry
- `src/components/PastEntries.js` - history and search view

## Notes

Entries are saved to `localStorage`, so the data stays on the current browser unless you export it first.