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

## Streamlit Version

This repository also includes a Streamlit implementation for deployment on Streamlit Cloud:

- `streamlit_app.py` - Streamlit app
- `requirements.txt` - Python dependencies for Streamlit Cloud
- `.streamlit/config.toml` - Streamlit theme config

Run locally:

```bash
pip install -r requirements.txt
streamlit run streamlit_app.py
```

Deploy on Streamlit Cloud with GitHub:

1. Push this project to a GitHub repository.
2. Go to Streamlit Cloud and click **New app**.
3. Select your GitHub repo and branch.
4. Set main file path to `streamlit_app.py`.
5. Deploy.

Streamlit Cloud will install dependencies from `requirements.txt` automatically.

## Notes

Entries are saved to `localStorage`, so the data stays on the current browser unless you export it first.