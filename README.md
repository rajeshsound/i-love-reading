# Katha Book Scanner

A frontend-only Progressive Web App for scanning ISBN barcodes, detecting duplicates, and saving your book inventory to an Excel file stored locally on your device.

## Features

- **ISBN Barcode Scanning** — Uses the browser's native `BarcodeDetector` API (Chrome/Edge) or manual entry fallback
- **Google Books Lookup** — Auto-fetches title, author, publisher, year, language, and MRP
- **Local Duplicate Detection** — Checks against your existing Excel inventory before adding
- **Excel File Management** — Creates and downloads `BookInventory.xlsx` to your device
- **Offline-First PWA** — Works without internet after first load; Google Books results are cached locally
- **Zero Sign-Up** — No accounts, no cloud, no passwords

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Excel | `xlsx` + `file-saver` |
| Offline Cache | IndexedDB |
| Camera | `BarcodeDetector` API + `getUserMedia` |
| PWA | Service Worker + Web App Manifest |

## Getting Started

```bash
npm install
npm run dev       # Development server at http://localhost:3000
npm run build     # Production build → dist/
npm run preview   # Preview production build
```

## Environment Variables

Copy `.env.example` to `.env` and fill in your Google Books API key (optional — the app works without it, just with stricter rate limits):

```
VITE_GOOGLE_API_KEY=your_key_here
```

Get a free key at Google Cloud Console → APIs & Services → Books API.

## Deploying to GitHub Pages

1. Set `base` in `vite.config.js` to your repo name if not deploying to root:
   ```js
   base: '/your-repo-name/'
   ```
2. Build: `npm run build`
3. Deploy the `dist/` folder to GitHub Pages

## How It Works

### File Storage
Books are saved in two places:
1. **IndexedDB** — fast in-browser cache for duplicate checking
2. **Downloaded Excel file** — `BookInventory.xlsx` saved to your device's Files app

On iOS, use Safari → "Add to Home Screen" to install as a PWA.

### Excel Format
```
ISBN | Title | Author | Language | MRP | Publisher | Year | Qty | Condition | Date Added | Notes
```

### iOS Usage
1. Open the app in Safari
2. Tap **Share → Add to Home Screen**
3. Scan books and tap **Save to Excel**
4. File saves to your Downloads/Files app
5. Open in Numbers, Excel, or Google Sheets

## Project Structure

```
src/
├── components/
│   ├── LoginPage.jsx       # First-launch welcome screen
│   ├── ScannerPage.jsx     # Main scanning interface
│   ├── BooksTable.jsx      # Pending books list with save button
│   ├── DuplicateModal.jsx  # Red alert for duplicate ISBNs
│   └── SettingsPage.jsx    # Export, import, clear data
├── services/
│   ├── excelService.js     # xlsx read/write + file-saver download
│   ├── googleBooksService.js  # ISBN → book data API call
│   └── storageService.js   # IndexedDB CRUD operations
├── App.jsx                 # Root component + tab navigation
└── main.jsx                # React entry point
public/
├── manifest.json           # PWA manifest
├── service-worker.js       # Offline caching strategy
└── icons/                  # App icons (192px, 512px PNG + SVG)
```
