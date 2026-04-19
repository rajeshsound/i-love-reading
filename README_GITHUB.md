# 📚 Katha Book Inventory Scanner

**Progressive Web App for scanning and managing book inventory with real-time duplicate detection and Microsoft OneDrive sync.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub](https://img.shields.io/badge/GitHub-Ready-brightgreen)](https://github.com/rajesh-soundararajan/book-inventory-scanner)

---

## 🎯 Features

- 📱 **Progressive Web App** - Install on home screen, works offline
- 🎥 **Barcode Scanning** - Camera-based ISBN scanning with fallback
- 📚 **Auto Lookup** - Fetch book details from Google Books API
- 🔴 **Duplicate Detection** - Real-time alerts when scanning duplicates
- 🔒 **Microsoft OAuth** - Secure login with Outlook account
- ☁️ **Cloud Sync** - Auto-sync to Microsoft OneDrive Excel
- 📊 **Inventory Tracking** - Manage book collection efficiently
- 🌐 **Offline Support** - Scan without internet, sync when connected

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Microsoft Outlook account (free)
- Google Cloud API key (free)

### Local Development

```bash
# Clone repository
git clone https://github.com/rajesh-soundararajan/book-inventory-scanner.git
cd book-inventory-scanner

# Setup frontend
cd frontend
npm install
npm run dev

# Setup backend (in new terminal)
cd ../backend
npm install
npm start
```

### Access App
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000

---

## 🔑 Configuration

### 1. Get Google API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable **Google Books API**
3. Create API Key
4. Copy to `.env` as `VITE_GOOGLE_API_KEY`

### 2. Get Microsoft OAuth Credentials
1. Go to [Azure Portal](https://portal.azure.com/)
2. Register new app in Azure
3. Add API permissions: `Files.ReadWrite`, `User.Read`
4. Create client secret
5. Copy Client ID and Secret to `.env`

### 3. Set Environment Variables

**Frontend (.env)**
```
VITE_MICROSOFT_CLIENT_ID=your_client_id
VITE_GOOGLE_API_KEY=your_api_key
VITE_API_BACKEND_URL=http://localhost:5000
```

**Backend (.env)**
```
AZURE_CLIENT_ID=your_client_id
AZURE_CLIENT_SECRET=your_client_secret
GOOGLE_API_KEY=your_api_key
MICROSOFT_TENANT=common
PORT=5000
```

---

## 📱 Usage

1. **Open App:** Visit http://localhost:5173
2. **Login:** Click "Connect with Microsoft"
3. **Authorize:** Grant app permissions
4. **Scan Books:** 
   - Enter ISBN manually or use camera
   - App fetches book details automatically
5. **Handle Duplicates:** 
   - If book exists, red alert appears
   - Choose: Skip or Add Anyway
6. **Sync to OneDrive:** 
   - Click "Sync to OneDrive"
   - Books appear in `BookInventory.xlsx`

---

## 📊 Data Structure

Books are stored with this schema:

```
ISBN | Title | Author | Language | MRP | Publisher | Year | Qty | Condition | Date | Notes
```

Example:
```
9780143421641 | The God of Small Things | Arundhati Roy | EN | 299 | Penguin | 1997 | 1 | Good | 4/19/2025 | Favorite
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│         PWA Frontend (React)             │
│  • ISBN Scanning                         │
│  • Duplicate Detection Modal             │
│  • Pending Books Table                   │
│  • Service Worker (Offline)              │
└────────────┬────────────────────────────┘
             │ HTTP/HTTPS
┌────────────▼────────────────────────────┐
│       Backend API (Node.js/Express)      │
│  • OAuth Handler                         │
│  • Microsoft Graph API Client            │
│  • Google Books API Client               │
│  • OneDrive Sync Logic                   │
└────────────┬────────────────────────────┘
             │ API Calls
┌────────────▼────────────────────────────┐
│    External APIs                         │
│  • Microsoft OAuth / OneDrive            │
│  • Google Books API                      │
└──────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
book-inventory-scanner/
├── frontend/                  # React PWA
│   ├── src/
│   │   ├── App.jsx           # Main component
│   │   ├── components/       # Reusable components
│   │   └── service-worker.js # PWA offline support
│   ├── public/
│   │   ├── manifest.json     # PWA metadata
│   │   └── icons/            # App icons
│   ├── vite.config.js
│   └── package.json
│
├── backend/                   # Node.js API
│   ├── src/
│   │   ├── server.js         # Express app
│   │   ├── routes/           # API endpoints
│   │   └── middleware/       # Auth, CORS, etc
│   ├── .env.example
│   └── package.json
│
├── docs/                      # Documentation
│   ├── SETUP.md              # Setup guide
│   ├── API.md                # API documentation
│   └── SCOPE.md              # Project scope
│
├── README.md                  # This file
├── CONTRIBUTING.md            # Contribution guide
├── LICENSE                    # MIT License
└── .github/
    └── workflows/            # GitHub Actions CI/CD
```

---

## 🔐 Security

- ✅ OAuth 2.0 authentication
- ✅ Client secret never exposed in frontend
- ✅ HTTPS required in production
- ✅ Token refresh mechanism
- ✅ CORS properly configured
- ✅ Input validation on all endpoints
- ✅ Rate limiting on API calls

---

## 🧪 Testing

Run tests:
```bash
cd frontend
npm test

cd ../backend
npm test
```

---

## 📦 Deployment

### Frontend (GitHub Pages)
```bash
cd frontend
npm run build
git push origin gh-pages
```

### Backend (Heroku Example)
```bash
cd backend
heroku create your-app-name
git push heroku main
```

### Environment Variables (Production)
Set on GitHub Secrets or Heroku:
- `VITE_MICROSOFT_CLIENT_ID`
- `VITE_GOOGLE_API_KEY`
- `VITE_API_BACKEND_URL`
- `AZURE_CLIENT_ID`
- `AZURE_CLIENT_SECRET`

---

## 📱 PWA Features

✅ **Installable** - Add to home screen  
✅ **Offline First** - Scan without internet  
✅ **Fast Loading** - Cached assets  
✅ **Native Feel** - Minimal browser UI  
✅ **Push Notifications** (future)  
✅ **Sync Queue** - Queue books while offline  

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons |
| **Backend** | Node.js, Express.js |
| **PWA** | Service Worker, Web App Manifest |
| **APIs** | Microsoft Graph, Google Books |
| **Storage** | Microsoft OneDrive (cloud) |
| **Hosting** | GitHub Pages + Heroku/Railway |
| **Build** | Vite, npm |

---

## 📊 Performance

- **First Load:** < 3 seconds (PWA cached)
- **ISBN Lookup:** < 2 seconds (Google Books API)
- **Duplicate Check:** < 1 second (OneDrive API)
- **Bundle Size:** < 250KB gzipped

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

---

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details

---

## 💬 Support

- 📖 Read [SETUP.md](docs/SETUP.md) for detailed setup
- 📚 Check [API.md](docs/API.md) for API documentation
- 🐛 Report bugs via GitHub Issues
- 💡 Request features via GitHub Discussions

---

## 🎯 Roadmap

### v1.0 (MVP - Current)
- ✅ ISBN scanning
- ✅ Duplicate detection
- ✅ Microsoft OneDrive sync
- ✅ PWA support

### v1.1 (Next)
- 📷 Enhanced barcode scanning
- 📊 Inventory dashboard
- 📈 Statistics & reports

### v2.0 (Future)
- 👥 Team collaboration
- 🔄 Batch import/export
- 🏷️ Label printing
- 📱 Native mobile app

---

## 📞 Contact

**Maintainer:** Rajesh Soundararajan  
**Email:** rajesh.soundararajan@outlook.com  
**Website:** [Katha](https://www.katha.org)

---

**Made with ❤️ for book lovers**

---

*Last Updated: April 2025*  
*Status: Production Ready ✅*
