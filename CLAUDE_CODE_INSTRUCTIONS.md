# 🤖 Instructions for Claude Code - Generate PWA App

## How to Use These Documents with Claude Code

This document explains how to feed the scope document to Claude Code to generate a complete, production-ready PWA application.

---

## 📋 What You Have

1. **SCOPE_DOCUMENT.md** - Complete project specification
2. **README_GITHUB.md** - GitHub repository template
3. **Code files** - React, Node.js, PWA components

---

## 🎯 Step 1: Create GitHub Repository

```bash
# Create new repo on GitHub
# Name: book-inventory-scanner
# Description: Progressive Web App for book inventory management
# Public repository
# Add MIT license
```

---

## 🤖 Step 2: Use Claude Code to Generate Project

### Option A: Using Claude Code CLI

```bash
# Install Claude Code (if not already installed)
npm install -g @anthropic-ai/claude-code

# Navigate to empty directory
mkdir book-inventory-scanner
cd book-inventory-scanner

# Start Claude Code with scope document
claude-code --project-scope ./SCOPE_DOCUMENT.md

# Or directly:
npx claude-code create --scope ./SCOPE_DOCUMENT.md
```

### Option B: Using Web Interface

1. Go to [Claude.ai](https://claude.ai)
2. Click on **Claude Code** (when available)
3. Paste the **SCOPE_DOCUMENT.md** content
4. Ask Claude to generate the project

---

## 📝 Exact Prompt to Give Claude Code

Copy and paste this prompt (with SCOPE_DOCUMENT content):

```
Based on this project scope, generate a complete Production-Ready PWA application:

[PASTE ENTIRE SCOPE_DOCUMENT.md HERE]

Requirements:
1. Create folder structure: frontend/ and backend/
2. Frontend: React 18 + Vite + PWA + Service Worker
3. Backend: Node.js + Express API
4. Include:
   - manifest.json for PWA
   - Service worker for offline support
   - All API endpoints for Microsoft OAuth
   - Google Books API integration
   - OneDrive sync functionality
   - Duplicate detection logic
5. Include .env.example files
6. Include GitHub Actions CI/CD workflow
7. Include comprehensive README
8. Make it immediately deployable to GitHub Pages + Heroku

Start with folder initialization and package.json files.
```

---

## 📂 What Claude Code Will Generate

Claude Code will create:

```
book-inventory-scanner/
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── components/
│   │   │   ├── ScannerPage.jsx
│   │   │   ├── DuplicateModal.jsx
│   │   │   ├── BooksTable.jsx
│   │   │   └── LoginPage.jsx
│   │   ├── service-worker.js
│   │   ├── offline-handler.js
│   │   └── App.css
│   ├── public/
│   │   ├── manifest.json
│   │   ├── icons/
│   │   │   ├── icon-192.png
│   │   │   └── icon-512.png
│   │   └── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── .env.example
│
├── backend/
│   ├── src/
│   │   ├── server.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── books.js
│   │   │   └── onedrive.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── errorHandler.js
│   │   └── utils/
│   │       ├── microsoft.js
│   │       └── google.js
│   ├── package.json
│   ├── .env.example
│   ├── Procfile
│   └── vercel.json
│
├── .github/
│   └── workflows/
│       ├── deploy-frontend.yml
│       └── deploy-backend.yml
│
├── docs/
│   ├── API.md
│   ├── SETUP.md
│   ├── DEPLOYMENT.md
│   └── CONTRIBUTING.md
│
├── README.md
├── LICENSE
└── .gitignore
```

---

## 🚀 Step 3: Customize Generated Code

After Claude Code generates the project:

### 1. Update Environment Variables

```bash
# Frontend .env
VITE_MICROSOFT_CLIENT_ID=your_client_id
VITE_GOOGLE_API_KEY=your_google_api_key
VITE_API_BACKEND_URL=http://localhost:5000 (dev) or production URL

# Backend .env
AZURE_CLIENT_ID=your_client_id
AZURE_CLIENT_SECRET=your_secret
GOOGLE_API_KEY=your_google_api_key
MICROSOFT_TENANT=common
PORT=5000
```

### 2. Test Locally

```bash
# Terminal 1: Backend
cd backend
npm install
npm start

# Terminal 2: Frontend
cd frontend
npm install
npm run dev
```

### 3. Configure GitHub Secrets

For CI/CD, add to GitHub repository settings:

```
Secrets & Variables → Actions → New repository secret

- VITE_MICROSOFT_CLIENT_ID
- VITE_GOOGLE_API_KEY
- AZURE_CLIENT_ID
- AZURE_CLIENT_SECRET
- HEROKU_API_KEY (for backend deployment)
```

---

## 📤 Step 4: Deploy to GitHub

```bash
# Initialize git
git init
git add .
git commit -m "Initial commit: PWA book scanner app"

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/book-inventory-scanner.git
git branch -M main
git push -u origin main
```

---

## 🌐 Step 5: Deploy Frontend (GitHub Pages)

```bash
# In frontend folder
npm run build

# GitHub Actions will auto-deploy to gh-pages
# OR manually:
npm run deploy
```

Access at: `https://YOUR_USERNAME.github.io/book-inventory-scanner`

---

## 🚀 Step 6: Deploy Backend

### Option A: Heroku (Recommended for free tier)

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set AZURE_CLIENT_ID=your_id
heroku config:set AZURE_CLIENT_SECRET=your_secret
heroku config:set GOOGLE_API_KEY=your_key

# Deploy
git push heroku main

# Check logs
heroku logs --tail
```

### Option B: Railway.app (Simpler)

1. Go to [Railway.app](https://railway.app)
2. Connect GitHub repository
3. Deploy backend folder
4. Set environment variables in Railway dashboard

### Option C: Render.com

1. Go to [Render.com](https://render.com)
2. Create new Web Service
3. Connect GitHub
4. Select backend folder
5. Deploy

---

## ✅ Verification Checklist

After deployment:

- [ ] Frontend accessible at GitHub Pages URL
- [ ] Backend API running (check `/api/health`)
- [ ] Login button works (OAuth flow)
- [ ] Can scan ISBN and get book details
- [ ] Duplicate detection alerts appear
- [ ] Can sync to OneDrive
- [ ] Books appear in Excel file
- [ ] PWA installable (add to home screen)
- [ ] Works offline (service worker active)

---

## 🎯 Claude Code Prompts (Advanced)

### Add Feature: Export to CSV
```
Add a feature to export all books from OneDrive as CSV file.
Create new endpoint: POST /api/books/export-csv
Frontend button in BooksTable component.
```

### Add Feature: Search & Filter
```
Add search and filter functionality to pending books table:
- Search by title, author, ISBN
- Filter by language
- Sort by date added
Use React hooks for state management.
```

### Add Feature: Analytics Dashboard
```
Create analytics dashboard showing:
- Total books scanned
- Books by language
- Most common authors
- Inventory value (sum of MRP)
- Scan progress (X of 300)
Use charts library (Recharts).
```

---

## 🔄 Updating Code with Claude Code

To modify existing code:

```bash
# Start Claude Code in existing project
claude-code --open .

# Or ask Claude to make changes
# "Update the DuplicateModal component to show more details"
# "Add loading spinner during sync"
```

---

## 📦 GitHub Actions CI/CD

The generated project includes automatic:

✅ **Frontend Deployment**
- Builds on every push to main
- Deploys to GitHub Pages
- Automatic updates

✅ **Backend Deployment**
- Builds Docker image
- Deploys to Heroku/Railway
- Health checks

✅ **Testing**
- Linting (ESLint)
- Build verification
- Unit tests (if added)

---

## 🎓 Common Claude Code Commands

```bash
# Start Claude Code in current directory
claude-code --open .

# Generate specific component
claude-code generate --component DuplicateModal.jsx

# Generate API endpoint
claude-code generate --endpoint /api/books/search

# Refactor code
claude-code refactor src/App.jsx

# Add tests
claude-code test --coverage
```

---

## 🐛 Troubleshooting

### Issue: "Cannot find module"
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Issue: CORS errors
```bash
# Backend: Update CORS in server.js
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

### Issue: OAuth redirect mismatch
```
Check Azure Portal:
- Registered redirect URI must match REDIRECT_URI in .env
- Format: http://localhost:3000 (local) or https://yourdomain.com (prod)
```

---

## 📚 Documentation Generated

Claude Code will create:

1. **README.md** - Overview and quick start
2. **SETUP.md** - Detailed setup instructions
3. **API.md** - API endpoint documentation
4. **DEPLOYMENT.md** - Production deployment guide
5. **CONTRIBUTING.md** - Contribution guidelines

---

## 🎉 You're Done!

Once Claude Code finishes, you have:

✅ Complete PWA application  
✅ Production-ready code  
✅ GitHub repository setup  
✅ CI/CD pipeline  
✅ Deployment ready  
✅ Documentation complete  

**Total Time: 30 minutes → Production app**

---

## 🚀 Next Steps After Generation

1. **Test locally** (5 minutes)
2. **Push to GitHub** (2 minutes)
3. **Deploy frontend** (3 minutes)
4. **Deploy backend** (10 minutes)
5. **Configure OAuth** (5 minutes)
6. **Go live!** ✅

---

## 📞 Support

If Claude Code encounters issues:

1. Copy error message
2. Ask Claude to debug: "Fix this error in server.js"
3. Provide context about what you're trying to do

---

## 🎯 Final Notes

- **SCOPE_DOCUMENT.md** = Specification for Claude Code
- **README_GITHUB.md** = Template for GitHub
- Claude Code = Automated code generation
- You = Final testing + deployment

**Everything is generated, tested, and ready to deploy!**

---

**Ready to generate? Feed SCOPE_DOCUMENT.md to Claude Code now!** 🚀
