# 📱 Katha Book Scanner - PWA Scope Document

## 🎯 Project Overview

**Book Inventory Management System** - A Progressive Web App (PWA) for scanning ISBN barcodes, detecting duplicates in real-time, and syncing book data to Microsoft OneDrive/SharePoint.

**Target User:** Rajesh Soundararajan (rajesh.soundararajan@outlook.com)  
**Deployment:** GitHub Pages + Backend API  
**Type:** Progressive Web App (PWA) - works offline, installable on mobile

---

## 🔑 Core Features

### 1. **ISBN Barcode Scanning**
- Camera-based barcode scanning (phone camera)
- Manual ISBN entry fallback
- ISBN validation (13-digit format)
- Real-time capture

### 2. **Book Data Lookup**
- Auto-fetch from Google Books API:
  - Title
  - Author
  - Publisher
  - Publication Year
  - Language
  - MRP (List Price)
  - Book thumbnail

### 3. **Duplicate Detection**
- Check against existing inventory (OneDrive/Outlook)
- **Red Alert Modal** when duplicate found showing:
  - New book details
  - Existing book details
  - Language variant info
  - Copy count
- User choice: **Skip** or **Add Anyway**

### 4. **Authentication**
- Microsoft OAuth 2.0 login
- Personal Outlook account support (`rajesh.soundararajan@outlook.com`)
- Secure token management
- Auto-refresh expired tokens

### 5. **Data Sync**
- Real-time sync to Microsoft OneDrive
- Create `BookInventory.xlsx` auto-synced
- Append new books to Excel worksheet
- Fetch existing books for duplicate detection

### 6. **Progressive Web App (PWA)**
- Install on home screen (mobile/desktop)
- Offline capability (scan when no internet)
- Service worker for offline sync queue
- Native app-like experience
- Works without internet, syncs when connected

---

## 📊 Data Structure

### Book Object
```
{
  isbn: "9780143421641",
  title: "The God of Small Things",
  author: "Arundhati Roy",
  language: "EN",
  mrp: "299",
  publisher: "Penguin Books",
  year: "1997",
  timestamp: "2025-04-19"
}
```

### OneDrive Excel Schema
| Column | Data |
|--------|------|
| A | ISBN |
| B | Title |
| C | Author |
| D | Language |
| E | MRP |
| F | Publisher |
| G | Year |
| H | Quantity |
| I | Condition |
| J | Date Added |
| K | Notes |

---

## 🏗️ Technical Architecture

### Frontend (PWA)
- **Framework:** React 18+
- **PWA:** Service Worker + Manifest
- **Camera:** `navigator.mediaDevices.getUserMedia()`
- **Storage:** IndexedDB for offline sync queue
- **UI:** Tailwind CSS + Lucide Icons
- **Build:** Vite

### Backend API
- **Runtime:** Node.js
- **Framework:** Express.js
- **APIs:** 
  - Microsoft Graph API (OAuth + OneDrive)
  - Google Books API (metadata lookup)

### Hosting
- **Frontend:** GitHub Pages (static PWA)
- **Backend:** Heroku / Railway / Render (free tier)
- **Storage:** Microsoft OneDrive (1TB free)

---

## 🔗 API Endpoints (Backend)

### Authentication
```
POST /api/auth/microsoft/token
  Input: authorization code
  Output: access_token, refresh_token
```

### Book Operations
```
POST /api/books/lookup
  Input: isbn
  Output: book details from Google Books API

POST /api/books/check-duplicate
  Input: accessToken, isbn, title
  Output: isDuplicate (true/false), existing book details

POST /api/onedrive/sync
  Input: accessToken, books[]
  Output: success, fileId

POST /api/onedrive/fetch
  Input: accessToken
  Output: existing books from Excel
```

---

## 📋 User Flow

```
1. User opens PWA app
   ↓
2. Click "Connect with Microsoft" (OAuth)
   ↓
3. Authorize app (first time only)
   ↓
4. Scan ISBN or enter manually
   ↓
5. Backend checks duplicate against OneDrive
   ↓
6. IF DUPLICATE:
   → Red alert modal appears
   → User chooses: Skip OR Add Anyway
   ELSE:
   → Book added to pending list
   ↓
7. Review pending books
   ↓
8. Click "Sync to OneDrive"
   ↓
9. Books append to BookInventory.xlsx
   ↓
10. Success message
    ↓
11. User can scan more books (repeat from step 4)
```

---

## 🎨 UI Pages

### 1. **Login Page**
- Katha branding
- "Connect with Microsoft" button
- Description

### 2. **Main Scanner Page**
- ISBN input field + scan button
- Camera toggle button
- Video feed (optional)
- Stats panel (books ready, total inventory, value)
- Pending books table

### 3. **Duplicate Alert Modal** (Red)
- New book vs. Existing book comparison
- Language info
- Copy count
- Buttons: Skip OR Add

### 4. **Pending Books Table**
- ISBN, Title, Author, Language, MRP
- Delete button per row
- Sync to OneDrive button

---

## ⚙️ Environment Variables

### Frontend (.env)
```
VITE_MICROSOFT_CLIENT_ID=<from_azure>
VITE_GOOGLE_API_KEY=<from_google_cloud>
VITE_API_BACKEND_URL=<backend_url>
```

### Backend (.env)
```
AZURE_CLIENT_ID=<from_azure>
AZURE_CLIENT_SECRET=<from_azure>
GOOGLE_API_KEY=<from_google_cloud>
MICROSOFT_TENANT=common
PORT=5000
```

---

## 📦 GitHub Repository Structure

```
book-scanner/
├── frontend/
│   ├── src/
│   │   ├── App.jsx (main scanner component)
│   │   ├── components/
│   │   ├── pages/
│   │   └── service-worker.js
│   ├── public/
│   │   ├── manifest.json (PWA manifest)
│   │   └── icons/ (app icons)
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
├── backend/
│   ├── src/
│   │   ├── server.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── books.js
│   │   │   └── onedrive.js
│   │   └── middleware/
│   ├── .env.example
│   ├── package.json
│   └── Procfile (for Heroku)
│
├── README.md
├── SETUP.md
├── CONTRIBUTING.md
└── LICENSE
```

---

## 🔐 Security Requirements

- ✅ OAuth 2.0 for authentication
- ✅ Client Secret never exposed in frontend
- ✅ HTTPS only for production
- ✅ Token refresh mechanism
- ✅ CORS properly configured
- ✅ Rate limiting on API endpoints
- ✅ Input validation on all endpoints

---

## 📱 PWA Requirements

- ✅ Service Worker (offline capability)
- ✅ Web App Manifest (metadata)
- ✅ HTTPS on production
- ✅ Install prompt on home screen
- ✅ Offline sync queue (IndexedDB)
- ✅ App icons (192px, 512px)
- ✅ Splash screen support
- ✅ Mobile responsive (viewport meta tag)

---

## 🧪 Testing Scope

### Functional Tests
- ✅ ISBN scanning and validation
- ✅ Book lookup from Google Books API
- ✅ Duplicate detection accuracy
- ✅ OAuth flow (login/logout)
- ✅ OneDrive sync
- ✅ Offline mode - scan without internet
- ✅ Sync queue - pending books when offline

### Edge Cases
- ✅ Invalid ISBN format
- ✅ Book not found in Google Books
- ✅ Network timeout during sync
- ✅ Expired OAuth token
- ✅ Duplicate with different language editions
- ✅ Camera permission denied
- ✅ Large batch sync (100+ books)

---

## 📊 Performance Goals

- **First Load:** < 3 seconds (PWA cached)
- **ISBN Lookup:** < 2 seconds (Google Books API)
- **Duplicate Check:** < 1 second (OneDrive API)
- **Sync Time:** < 5 seconds (100 books)
- **Bundle Size:** < 250KB (gzipped)

---

## 🚀 Deployment

### Frontend (GitHub Pages)
```bash
npm run build
# Push to gh-pages branch
```

### Backend (Heroku/Railway/Render)
```bash
git push heroku main
# OR deploy to Railway/Render
```

### Configuration
1. Set GitHub secrets for environment variables
2. GitHub Actions CI/CD pipeline
3. Auto-deploy on push to main
4. Backend health checks

---

## 📅 MVP Scope (Phase 1)

### Must Have
- ✅ ISBN scanning
- ✅ Book lookup
- ✅ Duplicate detection
- ✅ Microsoft OAuth
- ✅ OneDrive sync
- ✅ Pending books table
- ✅ Responsive UI

### Nice to Have (Phase 2)
- 📷 Camera barcode scanning enhancement
- 📊 Analytics dashboard
- 🔄 Batch import/export
- 👥 Team collaboration
- 📈 Inventory reports
- 🏷️ Barcode label printing

### Out of Scope (Phase 3+)
- Mobile app (native iOS/Android)
- Katha SharePoint integration
- Advanced ML for book recognition
- International barcode formats

---

## 📞 API Keys Required

1. **Google Cloud Console**
   - Google Books API key
   - No quota limits for free tier

2. **Azure Portal**
   - Microsoft OAuth Client ID
   - Client Secret
   - Personal Outlook account (free)

---

## 🎯 Success Criteria

✅ User can scan ISBN in < 30 seconds  
✅ Duplicate detection works in < 1 second  
✅ Books sync to OneDrive automatically  
✅ App works offline, syncs when connected  
✅ Can install on home screen (PWA)  
✅ No IT involvement required  
✅ Can scan 300 books in 2-3 hours  
✅ All data secure and encrypted  

---

## 📝 Notes

- **Browser Support:** Chrome/Edge 90+, Firefox 88+, Safari 14+
- **Devices:** Mobile (iOS/Android), Desktop (Windows/Mac)
- **Language:** JavaScript/React
- **License:** MIT
- **Maintenance:** Minimal (API calls only)

---

## 🎉 Deliverables

1. ✅ Fully functional PWA (GitHub Pages)
2. ✅ Backend API (Heroku/Railway)
3. ✅ Setup documentation
4. ✅ GitHub repository with CI/CD
5. ✅ README with deployment instructions
6. ✅ CONTRIBUTING guide for future enhancements

---

**Document Version:** 1.0  
**Last Updated:** April 2025  
**Status:** Ready for Claude Code generation
