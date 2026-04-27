# Daily Dump

Daily Dump is a small React journaling app for writing short daily notes, browsing past entries, and keeping a local backup in the browser.

## Features

- Write and autosave entries by date
- Move between today and previous days
- Browse past entries with search
- Clear search and return to writing from the past entries screen
- Import and export entries as JSON
- Export all or date-range entries as TXT
- Dedicated achievements page with expanded milestones
- Store data locally in the browser

## Recommended Deployment

Use Vercel for the React frontend and Render for any backend API you add later.

- Frontend: Vercel
- API/backend: Render

This repo currently ships the frontend app and a small API client scaffold. The React app still works without a backend because it stores data locally in the browser.

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
- `src/config.js` - frontend environment config
- `src/utils/api.js` - fetch helper for a future API backend

## Vercel Deployment

1. Push this repo to GitHub.
2. Import the repo into Vercel.
3. Set the root directory to `FULL-STACK`.
4. Use the default React build command: `npm run build`.
5. Leave the output directory as `build`.
6. Add `REACT_APP_API_BASE_URL` if you connect a backend.

The included [vercel.json](vercel.json) handles SPA routing so refreshes work correctly.

## Render API Backend

If you add API routes later, deploy that backend separately on Render.

- Give the backend a public URL.
- Set that URL in `REACT_APP_API_BASE_URL` on Vercel.
- Keep frontend and backend deployments independent.

If you prefer Railway, you can use it the same way, but Render is the simpler fit for this repo.

## Notes

Entries are saved to `localStorage`, so the data stays on the current browser unless you export it first.