# Katha Book Scanner

A Progressive Web App for scanning ISBN barcodes, detecting duplicate books, and syncing your library to Microsoft OneDrive as an Excel file.

## Features

- **ISBN Scanning** — camera barcode scanner + manual entry
- **Google Books Lookup** — auto-fetches title, author, publisher, language, MRP
- **Duplicate Detection** — red alert modal with side-by-side comparison
- **OneDrive Sync** — appends books to `BookInventory.xlsx`
- **PWA** — installable, works offline with queued sync via IndexedDB
- **Microsoft OAuth** — secure login with personal Outlook account

## Quick Start

See [docs/SETUP.md](docs/SETUP.md) for full setup instructions.

```bash
# Backend
cd backend && npm install && npm run dev

# Frontend
cd frontend && npm install && npm run dev
```

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, Tailwind CSS, vite-plugin-pwa |
| Backend | Node.js, Express, ExcelJS |
| Auth | Microsoft OAuth 2.0 (MSAL) |
| Storage | Microsoft OneDrive (Excel) + IndexedDB (offline) |
| Deploy | GitHub Pages + Render/Railway/Heroku |

## Environment Variables

**Frontend** (`frontend/.env`):
```
VITE_MICROSOFT_CLIENT_ID=
VITE_GOOGLE_API_KEY=
VITE_API_BACKEND_URL=
```

**Backend** (`backend/.env`):
```
AZURE_CLIENT_ID=
AZURE_CLIENT_SECRET=
GOOGLE_API_KEY=
FRONTEND_URL=
```

## License

MIT
